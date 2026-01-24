import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AddDeviceButton from '@/components/AddDeviceDialog';
import LogoutButton from '@/components/LogoutConfirmationDialog';
import AutoRefresh from '@/components/AutoRefresh';

export default async function DevicesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: devices } = await supabase
        .from('devices')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    // MVP: N+1 Fetching for status and telemetry
    const devicesWithData = await Promise.all((devices || []).map(async (device) => {
        // Fetch latest run for status
        const { data: runs } = await supabase
            .from('fermentation_runs')
            .select('status')
            .eq('device_id', device.id)
            .order('created_at', { ascending: false })
            .limit(1);

        const latestRun = runs?.[0];
        // Derive Status
        let statusDisplay = 'Idle';
        let statusColor = 'bg-gray-100 text-gray-600';

        if (latestRun?.status === 'running') {
            statusDisplay = 'Berjalan';
            statusColor = 'bg-green-100 text-green-700';
        } else if (latestRun?.status === 'done') {
            statusDisplay = 'Selesai';
            statusColor = 'bg-blue-100 text-blue-700';
        }

        // Fetch latest telemetry
        const { data: telemetries } = await supabase
            .from('telemetry')
            .select('ph, temp_c')
            .eq('device_id', device.id)
            .order('created_at', { ascending: false })
            .limit(1);

        const latestTelemetry = telemetries?.[0];

        return {
            ...device,
            statusDisplay,
            statusColor,
            temp: latestTelemetry?.temp_c || '--',
            ph: latestTelemetry?.ph || '--'
        };
    }));

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans">
            <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-[#F5F5F5]">
                {/* Header */}
                <header className="flex justify-between items-center p-6 pb-2">
                    <div className="flex items-center gap-2">
                        {/* Current Logo Placeholder (Cassava/Leaf shape) */}
                        <div className="text-[#8B5E3C]">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM6 13C6.55 13 7 13.45 7 14C7 14.55 6.55 15 6 15C5.45 15 5 14.55 5 14C5 13.45 5.45 13 6 13ZM18 13C18.55 13 19 13.45 19 14C19 14.55 18.55 15 18 15C17.45 15 17 14.55 17 14C17 13.45 17.45 13 18 13ZM12 5C14.05 5 15.93 5.76 17.41 7.03C17.75 7.32 17.78 7.82 17.49 8.16C17.2 8.5 16.7 8.53 16.36 8.24C15.17 7.21 13.65 6.6 12 6.6C10.35 6.6 8.83 7.21 7.64 8.24C7.3 8.53 6.8 8.5 6.51 8.16C6.22 7.82 6.25 7.32 6.59 7.03C8.07 5.76 9.95 5 12 5Z" />
                            </svg>
                        </div>
                        <span className="text-xl font-normal text-black tracking-wide">SmartMocaf</span>
                    </div>

                    {/* Logout Button */}
                    <LogoutButton />
                </header>

                {/* Page Content */}
                <main className="flex-1 px-6 pt-4 flex flex-col">
                    {/* Section Title */}
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-1.5 h-8 bg-black"></div>
                        <h2 className="text-xl font-normal text-black">Daftar Alat</h2>
                    </div>

                    {/* Device List or Empty State */}
                    <div className="flex-1 flex flex-col">
                        {devicesWithData.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-lg text-black font-normal">Tidak ada alat terhubung</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {devicesWithData.map((device) => (
                                    <DeviceCard
                                        key={device.id}
                                        id={device.id}
                                        name={device.name}
                                        statusDisplay={device.statusDisplay}
                                        statusColor={device.statusColor}
                                        temp={device.temp}
                                        ph={device.ph}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Add Button */}
                    <div className="pb-10 pt-6">
                        <AddDeviceButton />
                    </div>
                </main>
                <AutoRefresh />
            </div>
        </div>
    );
}

function DeviceCard({ id, name, statusDisplay, statusColor, temp, ph }: any) {
    return (
        <Link href={`/devices/${id}`} className="block">
            <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor}`}>
                            {statusDisplay}
                        </span>
                    </div>
                    <div className="text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg>
                        {temp}°C
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.48 0L12 2.69z" /><path d="M16 13a3 3 0 0 1-5.66 0" /><path d="M12 16a2 2 0 0 1 2-2" /></svg>
                        pH {ph}
                    </div>
                </div>
            </div>
        </Link>
    );
}
