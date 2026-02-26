import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UptimeChart from '@/components/admin/UptimeChart';
import RealtimeDeviceStats from '@/components/admin/RealtimeDeviceStats';
import AutoRefresh from '@/components/AutoRefresh';
import { formatTimeAgo } from '@/utils/date';

export default async function AdminPage() {
    const session = await getSession();

    if (!session) redirect('/auth/login');

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true, fullName: true }
    });

    if (user?.role !== 'admin') redirect('/farmer');

    // Fetch stats
    const [totalDevices, onlineDevices, totalUsers, runningFermentations, devices] = await Promise.all([
        prisma.device.count(),
        prisma.device.count({ where: { isOnline: true } }),
        prisma.user.count({ where: { role: 'farmer' } }),
        prisma.fermentationRun.count({ where: { status: 'running' } }),
        prisma.device.findMany({
            include: {
                deviceUsers: {
                    include: { user: { select: { fullName: true } } },
                    where: { role: 'owner' }
                },
                telemetry: { orderBy: { createdAt: 'desc' }, take: 1 }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        })
    ]);

    // Build realtime stats initial data
    const realtimeDevices = devices.map((d: any) => {
        const telem = d.telemetry?.[0];
        const isOnline = d.isOnline;

        let statusDisplay = 'Idle';
        let statusColor = 'bg-gray-100 text-gray-600';
        if (isOnline) {
            statusDisplay = 'Online';
            statusColor = 'bg-green-100 text-green-700';
        } else {
            statusDisplay = 'Offline';
            statusColor = 'bg-red-100 text-red-600';
        }

        return {
            id: d.id,
            name: d.name,
            device_code: d.deviceCode,
            is_online: isOnline,
            temp: telem ? Number(telem.tempC) : null,
            ph: telem ? Number(telem.ph) : null,
            waterLevel: telem?.waterLevel ?? null,
            ownerName: d.deviceUsers?.[0]?.user?.fullName || null,
            statusDisplay,
            statusColor,
            lastTelemetry: d.lastSeen?.toISOString() || null,
        };
    });

    // MQTT Status
    const mqttStatus = await prisma.mqttStatus.findFirst({
        orderBy: { lastUpdated: 'desc' }
    });

    // Build uptime data for chart (based on actual online status)
    const uptimeData = devices.map((d: any) => {
        let uptimePercent = 0;
        if (d.isOnline) {
            uptimePercent = 100;
        } else if (d.lastSeen) {
            const hoursAgo = (Date.now() - new Date(d.lastSeen).getTime()) / (1000 * 60 * 60);
            if (hoursAgo < 1) uptimePercent = 80;
            else if (hoursAgo < 6) uptimePercent = 60;
            else if (hoursAgo < 24) uptimePercent = 30;
            else uptimePercent = 10;
        }

        return {
            label: d.name?.slice(0, 8) || d.deviceCode || '?',
            uptimePercent,
            isOnline: d.isOnline
        };
    });

    const firstName = user?.fullName?.split(' ')[0] || 'Admin';
    const currentDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Halo, {firstName}</h1>
                    <p className="text-sm text-gray-400 mt-0.5">{currentDate}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Sistem Aktif</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Devices */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                <line x1="8" y1="21" x2="16" y2="21"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-2xl font-bold text-gray-900">{totalDevices}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Perangkat</p>
                        </div>
                    </div>
                </div>

                {/* Online */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-2xl font-bold text-green-600">{onlineDevices}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Online</p>
                        </div>
                    </div>
                </div>

                {/* Running */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#009e3e]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#009e3e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-2xl font-bold text-[#009e3e]">{runningFermentations}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Fermentasi</p>
                        </div>
                    </div>
                </div>

                {/* Users */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Pengguna</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Uptime Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Status Uptime Perangkat</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Persentase waktu aktif setiap perangkat</p>
                    </div>
                </div>
                <div className="p-4 sm:p-5">
                    <UptimeChart data={uptimeData} />
                </div>
            </div>

            {/* MQTT Status — compact */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-10 h-10 bg-[#009e3e]/10 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#009e3e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                                <path d="M8.59 16.11a6 6 0 0 1 6.82 0" />
                                <circle cx="12" cy="20" r="1" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">MQTT Broker</h3>
                            <p className="text-xs text-gray-400">
                                {mqttStatus?.lastUpdated 
                                    ? `Terakhir: ${formatTimeAgo(mqttStatus.lastUpdated)}` 
                                    : 'Menunggu koneksi...'}
                            </p>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="bg-gray-900 rounded-xl p-3 max-h-20 overflow-y-auto scrollbar-hide">
                            <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre-wrap break-all">
                                {mqttStatus?.message 
                                    ? JSON.stringify(JSON.parse(mqttStatus.message as string), null, 2) 
                                    : '// Menunggu payload...'}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Realtime Device Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Monitor Perangkat (Realtime)</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Data langsung dari MQTT — termasuk suhu perangkat dan jarak sensor</p>
                </div>
                <RealtimeDeviceStats initialDevices={realtimeDevices} />
            </div>

            <AutoRefresh />
        </div>
    );
}
