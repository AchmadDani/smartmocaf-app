import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { createDevice } from '../actions/device';
import { redirect } from 'next/navigation';

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

    // Server Action Wrapper for inline form (testing)
    async function handleAddDevice(formData: FormData) {
        'use server';
        const name = formData.get('name') as string;
        const code = `DEV-${Date.now().toString().slice(-4)}`; // Random code
        await createDevice(name, code);
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-md mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">SmartMocaf</h1>
                    <form action={async () => {
                        'use server';
                        const supabase = await createClient();
                        await supabase.auth.signOut();
                        redirect('/login');
                    }}>
                        <button
                            type="submit"
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Keluar"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        </button>
                    </form>
                </div>

                <div className="space-y-4">
                    {devicesWithData.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl shadow-sm">
                            <p className="text-gray-500">Belum ada perangkat</p>
                        </div>
                    ) : (
                        devicesWithData.map((device) => (
                            <DeviceCard
                                key={device.id}
                                id={device.id}
                                name={device.name}
                                statusDisplay={device.statusDisplay}
                                statusColor={device.statusColor}
                                temp={device.temp}
                                ph={device.ph}
                            />
                        ))
                    )}

                    {/* Developer Tools: Simple Add Device */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Developer Tools</h3>
                        <form action={handleAddDevice} className="flex gap-2">
                            <input
                                name="name"
                                placeholder="Nama Device Baru"
                                className="flex-1 px-3 py-2 border rounded-lg text-sm text-black"
                                required
                            />
                            <button className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-black">
                                + Add
                            </button>
                        </form>
                    </div>
                </div>
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
