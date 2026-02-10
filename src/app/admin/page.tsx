import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AutoRefresh from '@/components/AutoRefresh';
import RealtimeDeviceStats from '@/components/admin/RealtimeDeviceStats';
import { formatTimeAgo } from '@/utils/date';

export default async function AdminPage() {
    const session = await getSession();

    if (!session) {
        redirect('/auth/login');
    }

    // Role Check
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true, fullName: true }
    });

    if (user?.role !== 'admin') {
        redirect('/farmer');
    }

    // Fetch ALL devices with owner info and latest data
    const devices = await prisma.device.findMany({
        include: {
            user: {
                select: { fullName: true }
            },
            fermentationRuns: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            telemetry: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Process devices for display
    const devicesWithData = devices.map((device: any) => {
        const latestRun = device.fermentationRuns[0];
        let statusDisplay = 'Idle';
        let statusColor = 'bg-gray-100 text-gray-600';

        if (latestRun?.status === 'running') {
            statusDisplay = 'Berjalan';
            statusColor = 'bg-green-100 text-green-700';
        } else if (latestRun?.status === 'done') {
            statusDisplay = 'Selesai';
            statusColor = 'bg-blue-100 text-blue-700';
        }

        const latestTelemetry = device.telemetry[0];

        return {
            ...device,
            device_code: device.deviceCode, // Compatibility with client component
            statusDisplay,
            statusColor,
            mode: latestRun?.mode || 'auto',
            temp: latestTelemetry?.tempC ?? '--',
            ph: latestTelemetry?.ph ?? '--',
            waterLevel: latestTelemetry?.waterLevel ?? '--',
            lastTelemetry: latestTelemetry?.createdAt,
            ownerName: device.user?.fullName || null,
            isUnassigned: !device.userId,
            is_online: device.isOnline
        } as any;
    });

    const totalDevices = devicesWithData.length;
    const onlineDevices = devicesWithData.filter((d: any) => d.is_online).length;
    const runningDevices = devicesWithData.filter((d: any) => d.statusDisplay === 'Berjalan').length;
    const unassignedDevices = devicesWithData.filter((d: any) => d.isUnassigned).length;

    // Fetch MQTT Status
    const mqttStatus = await prisma.mqttStatus.findFirst({
        orderBy: { lastUpdated: 'desc' }
    });

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                    <p className="text-gray-500 mt-1">Pantau seluruh perangkat dalam satu tampilan</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm text-sm text-gray-600 font-medium border border-gray-100">
                        {new Date().toLocaleString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short'
                        })}
                    </div>
                </div>
            </div>

            {/* MQTT Status Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#009e3e]/10 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#009e3e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                                <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                                <path d="M8.59 16.11a6 6 0 0 1 6.82 0" />
                                <circle cx="12" cy="20" r="1" />
                            </svg>
                        </div>
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Status Koneksi MQTT</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active</span>
                    </div>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Webhook Endpoint</p>
                        <p className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 break-all">
                            /api/mqtt-webhook
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Terakhir Diterima</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {mqttStatus?.lastUpdated 
                                ? formatTimeAgo(mqttStatus.lastUpdated) 
                                : 'Belum ada data'}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                            {mqttStatus?.lastUpdated 
                                ? new Date(mqttStatus.lastUpdated).toLocaleTimeString('id-ID')
                                : '-'}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Payload Terakhir</p>
                        <div className="max-h-24 overflow-y-auto bg-gray-900 rounded-xl p-3 scrollbar-hide">
                            <pre className="text-[10px] font-mono text-emerald-400">
                                {mqttStatus?.message 
                                    ? JSON.stringify(JSON.parse(mqttStatus.message as string), null, 2) 
                                    : '// Menunggu payload...'}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                <line x1="8" y1="21" x2="16" y2="21"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Alat</p>
                            <p className="text-2xl font-bold text-gray-900">{totalDevices}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Online</p>
                            <p className="text-2xl font-bold text-green-600">{onlineDevices}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#009e3e]/10 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#009e3e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Fermentasi</p>
                            <p className="text-2xl font-bold text-[#009e3e]">{runningDevices}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Belum Diklaim</p>
                            <p className="text-2xl font-bold text-orange-600">{unassignedDevices}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Device List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">Daftar Semua Alat (Real-time)</h2>
                </div>

                {devicesWithData.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">Tidak ada alat terdaftar</p>
                    </div>
                ) : (
                    <RealtimeDeviceStats initialDevices={devicesWithData} />
                )}
            </div>
            <AutoRefresh />
        </div>
    );
}

