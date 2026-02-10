import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import DeviceCard from '@/components/DeviceCard';
import AddDeviceDialog from '@/components/AddDeviceDialog';
import { signOut } from '@/app/actions/auth';

export default async function FarmerDashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect('/auth/login');
    }

    // Get user profile
    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { fullName: true, role: true }
    });

    // Redirect admin to admin dashboard
    if (user?.role === 'admin') {
        redirect('/admin');
    }

    // Fetch user's devices with latest data
    const devices = await prisma.device.findMany({
        where: { userId: session.userId },
        include: {
            fermentationRuns: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            telemetry: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: { createdAt: 'desc' }
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
            device_code: device.deviceCode, // Compatibility
            statusDisplay,
            statusColor,
            mode: latestRun?.mode || 'auto',
            temp: latestTelemetry?.tempC ?? '--',
            ph: latestTelemetry?.ph ?? '--',
            waterLevel: latestTelemetry?.waterLevel ?? '--',
            isOnline: device.isOnline
        } as any;
    });

    const onlineCount = devicesWithData.filter((d: any) => d.isOnline).length;
    const runningCount = devicesWithData.filter((d: any) => d.statusDisplay === 'Berjalan').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <Image 
                                src="/assets/images/logos/Logo Growify Tech + Smart Mocaf.png"
                                alt="Growify"
                                width={120}
                                height={32}
                                className="h-7 sm:h-8 w-auto object-contain"
                            />
                        </Link>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <AddDeviceDialog variant="button" />
                            <form action={signOut}>
                                <button 
                                    type="submit"
                                    className="text-gray-400 hover:text-gray-600 p-1.5 sm:p-2 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                        <polyline points="16 17 21 12 16 7"/>
                                        <line x1="21" y1="12" x2="9" y2="12"/>
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
                {/* Welcome Mobile */}
                <div className="mb-6 sm:hidden">
                    <p className="text-gray-500 text-sm">Selamat datang,</p>
                    <h1 className="text-xl font-bold text-gray-900">{user?.fullName || 'Farmer'}</h1>
                </div>

                {/* Stats - Horizontal Scroll on Mobile */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 scrollbar-hide">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-shrink-0 w-[140px] sm:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#009e3e]/10 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#009e3e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                    <line x1="8" y1="21" x2="16" y2="21"/>
                                    <line x1="12" y1="17" x2="12" y2="21"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-900">{devicesWithData.length}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Total Alat</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-shrink-0 w-[140px] sm:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-900">{onlineCount}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Online</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-shrink-0 w-[140px] sm:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-xl font-bold text-gray-900">{runningCount}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Proses</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Devices */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Daftar Alat</h2>
                </div>

                {devicesWithData.length === 0 ? (
                    <div className="text-center py-12 px-6 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                <line x1="12" y1="17" x2="12" y2="21"/>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Belum ada alat</h3>
                        <p className="text-sm text-gray-500 mb-6">Tambahkan alat pertama Anda untuk mulai monitoring</p>
                        <AddDeviceDialog />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {devicesWithData.map((device: any) => (
                            <DeviceCard
                                key={device.id}
                                id={device.id}
                                name={device.name}
                                deviceCode={device.device_code}
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
        </div>
    );
}
