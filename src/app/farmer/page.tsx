
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import DeviceCard from '@/components/DeviceCard';
import AddDeviceDialog from '@/components/AddDeviceDialog';
import LogoutButton from '@/components/LogoutButton';
import AutoRefresh from '@/components/AutoRefresh';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Cpu, 
    Wifi, 
    Activity, 
    Plus, 
    LogOut, 
    Search,
    LayoutDashboard,
    Bell,
    Fingerprint,
    Waves
} from 'lucide-react';

export default async function FarmerDashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect('/auth/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { fullName: true, role: true }
    });

    if (user?.role === 'admin') {
        redirect('/admin');
    }

    // Fetch devices where user is either owner or viewer
    const deviceLinks = await prisma.deviceUser.findMany({
        where: { userId: session.userId },
        include: {
            device: {
                include: {
                    fermentationRuns: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    },
                    telemetry: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            }
        },
        orderBy: { joinedAt: 'desc' }
    });

    const devicesWithData = deviceLinks.map((link: any) => {
        const device = link.device;
        const latestRun = device.fermentationRuns[0];
        let statusDisplay = 'Idle';
        let statusColor = 'bg-gray-50 text-gray-400 border-gray-100';

        if (latestRun?.status === 'running') {
            statusDisplay = 'Berjalan';
            statusColor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
        } else if (latestRun?.status === 'done') {
            statusDisplay = 'Selesai';
            statusColor = 'bg-blue-50 text-blue-600 border-blue-100';
        }

        const latestTelemetry = device.telemetry[0];

        return {
            id: device.id,
            name: device.name,
            deviceCode: device.deviceCode,
            role: link.role,
            statusDisplay,
            statusColor,
            mode: latestRun?.mode || 'auto',
            temp: latestTelemetry?.tempC ? Number(latestTelemetry.tempC) : 0,
            ph: latestTelemetry?.ph ? Number(latestTelemetry.ph) : 0,
            waterLevel: latestTelemetry?.waterLevel ?? 0,
            isOnline: device.isOnline
        } as any;
    });

    const onlineCount = devicesWithData.filter((d: any) => d.isOnline).length;
    const runningCount = devicesWithData.filter((d: any) => d.statusDisplay === 'Berjalan').length;
    const firstName = user?.fullName?.split(' ')[0] || 'Farmer';
    const initial = firstName[0]?.toUpperCase() || 'F';

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-24">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 h-16 md:h-20">
                <div className="max-w-6xl mx-auto px-4 md:px-6 h-full">
                    <div className="flex items-center justify-between h-full">
                        <div className="relative w-16 h-16 md:w-20 md:h-20">
                            <Image 
                                src="/assets/images/logos/Logo Growify Tech + Smart Mocaf.png" 
                                alt="SmartMocaf" 
                                fill
                                className="object-contain"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                             <Button variant="ghost" size="icon" className="h-9 w-9 md:h-10 md:w-10 rounded-xl md:rounded-2xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all">
                                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                            </Button>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
                {/* Greeting */}
                <div className="flex items-center justify-between mb-8 md:mb-10 group">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100/50 shadow-sm">
                                System Ready
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                            Halo, {firstName}
                        </h1>
                        <p className="text-gray-400 mt-2 font-bold text-sm">Monitor seluruh batch fermentasi Anda secara real-time.</p>
                    </div>
                    <div className="hidden sm:block">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-[2rem] bg-white flex items-center justify-center border border-gray-100 shadow-xl shadow-gray-200/50 font-black text-lg md:text-xl text-primary">
                            {initial}
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-12">
                    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Total Unit</p>
                        <h3 className="text-2xl md:text-3xl font-black text-gray-900 leading-none">{devicesWithData.length}</h3>
                        <div className="absolute -bottom-1 -right-1 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Cpu className="h-10 w-10 md:h-12 md:w-12" />
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Online</p>
                        <h3 className="text-2xl md:text-3xl font-black text-emerald-500 leading-none">{onlineCount}</h3>
                        <div className="absolute -bottom-1 -right-1 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Wifi className="h-10 w-10 md:h-12 md:w-12" />
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Berjalan</p>
                        <h3 className="text-2xl md:text-3xl font-black text-blue-500 leading-none">{runningCount}</h3>
                        <div className="absolute -bottom-1 -right-1 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Activity className="h-10 w-10 md:h-12 md:w-12" />
                        </div>
                    </div>
                </div>

                {/* Device List Section Header — Vertical on mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center text-white">
                            <LayoutDashboard className="h-4 w-4" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Perangkat Anda</h2>
                        <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                            {devicesWithData.length}
                        </span>
                    </div>
                    <AddDeviceDialog variant="button" />
                </div>

                {devicesWithData.length === 0 ? (
                    <div className="text-center py-20 px-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200">
                            <Cpu className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">Belum ada perangkat</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10 leading-relaxed">
                            Hubungkan unit fermenter SmartMocaf Anda<br/>untuk mulai mengumpulkan data.
                        </p>
                        <div className="flex justify-center">
                            <AddDeviceDialog />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {devicesWithData.map((device: any) => (
                            <DeviceCard
                                key={device.id}
                                id={device.id}
                                name={device.name}
                                deviceCode={device.deviceCode}
                                statusDisplay={device.statusDisplay}
                                statusColor={device.statusColor}
                                temp={device.temp}
                                ph={device.ph}
                                waterLevel={device.waterLevel}
                                isOnline={device.isOnline}
                                href={`/farmer/${device.id}`}
                            />
                        ))}
                    </div>
                )}
            </main>
            <AutoRefresh />
        </div>
    );
}
