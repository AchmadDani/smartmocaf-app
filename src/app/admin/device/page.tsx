import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import MonitoringPanel from '@/components/farmer/MonitoringPanel';

interface Props {
    searchParams: Promise<{ id?: string }>;
}

export default async function AdminDeviceDetailPage({ searchParams }: Props) {
    const params = await searchParams;
    const deviceId = params.id;
    
    if (!deviceId) {
        redirect('/admin');
    }

    const session = await getSession();

    if (!session) {
        redirect('/auth/login');
    }

    // Role check
    const userProfile = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true }
    });

    if (userProfile?.role !== 'admin') {
        redirect('/farmer');
    }

    // Fetch device (admin can see all)
    const device = await prisma.device.findUnique({
        where: { id: deviceId },
        include: {
            user: {
                select: { fullName: true }
            },
            settings: true,
            fermentationRuns: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            telemetry: {
                orderBy: { createdAt: 'desc' },
                take: 20
            }
        }
    });

    if (!device) {
        notFound();
    }

    // Process data for the UI
    const latestRun = device.fermentationRuns[0];
    const status = latestRun?.status || 'idle';
    const mode = latestRun?.mode || 'auto';

    const deviceSettings = {
        target_ph: Number(device.settings?.targetPh ?? 4.5),
        auto_drain_enabled: device.settings?.autoDrainEnabled ?? false,
    };

    const latestTelemetry = device.telemetry[0] || null;
    const recentTelemetry = device.telemetry;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                    <Link 
                        href="/admin"
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 hover:border-[#009e3e]/30 shadow-sm hover:shadow-md transition-all group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400 group-hover:text-[#009e3e] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{device.name}</h1>
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                device.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                                <div className={`w-2 h-2 rounded-full ${device.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                {device.isOnline ? 'Sistem Aktif' : 'Terputus'}
                            </div>
                        </div>
                        <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold uppercase">{device.deviceCode || deviceId.slice(0, 8)}</span>
                            <span className="text-gray-300">•</span>
                            <span className="font-medium">Pemilik: <span className="text-gray-700 font-bold">{device.user?.fullName || 'Tidak Diketahui'}</span></span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <MonitoringPanel
                            deviceId={deviceId}
                            telemetry={latestTelemetry ? {
                                ph: Number(latestTelemetry.ph),
                                temp_c: Number(latestTelemetry.tempC),
                                water_level: latestTelemetry.waterLevel
                            } : null}
                            status={status}
                            mode={mode}
                            settings={deviceSettings}
                            isOnline={device.isOnline ?? false}
                            readonly={true}
                        />
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                             <svg className="w-5 h-5 text-[#009e3e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
                             Spesifikasi Perangkat
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center group">
                                <span className="text-sm font-medium text-gray-500">Device ID</span>
                                <span className="font-mono text-sm font-bold text-[#009e3e] bg-[#009e3e]/5 px-2 py-1 rounded-lg">{device.deviceCode}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500">Koneksi</span>
                                <span className={`text-sm font-bold uppercase tracking-wider ${device.isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                                    {device.isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500">Terakhir Update</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {device.lastSeen 
                                        ? new Date(device.lastSeen).toLocaleString('id-ID', {
                                            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short'
                                        })
                                        : '-'
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500">Mode Operasi</span>
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-md">{mode}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-gray-900">Data Realtime</h3>
                            <button className="text-[10px] font-black uppercase tracking-widest text-[#009e3e] hover:bg-[#009e3e]/5 px-2 py-1 rounded transition-colors">Record: {recentTelemetry.length}</button>
                        </div>
                        {recentTelemetry.length > 0 ? (
                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {recentTelemetry.slice(0, 15).map((t: any) => (
                                    <div key={t.id.toString()} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            {new Date(t.createdAt).toLocaleTimeString('id-ID', { hour12: false })}
                                        </span>
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-black text-gray-900">{Number(t.ph).toFixed(2)}</span>
                                                <span className="text-[8px] font-bold text-blue-500 uppercase">pH</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-black text-gray-900">{Number(t.tempC).toFixed(1)}°</span>
                                                <span className="text-[8px] font-bold text-orange-500 uppercase">SUHU</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-400 text-xs font-medium">Belum ada aktivitas data</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
