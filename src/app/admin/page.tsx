import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AutoRefresh from '@/components/AutoRefresh';
import DeviceCard from '@/components/DeviceCard';

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Role Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/devices');
    }

    // Fetch ALL devices
    const { data: devices } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false });

    // Fetch details
    const devicesWithData = await Promise.all((devices || []).map(async (device) => {
        const { data: runs } = await supabase
            .from('fermentation_runs')
            .select('status')
            .eq('device_id', device.id)
            .order('created_at', { ascending: false })
            .limit(1);

        const latestRun = runs?.[0];
        let statusDisplay = 'Idle';
        let statusColor = 'bg-gray-100 text-gray-600';

        if (latestRun?.status === 'running') {
            statusDisplay = 'Berjalan';
            statusColor = 'bg-green-100 text-green-700';
        } else if (latestRun?.status === 'done') {
            statusDisplay = 'Selesai';
            statusColor = 'bg-blue-100 text-blue-700';
        }

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
        <div className="font-sans">
            {/* Header Area */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Pantau seluruh perangkat dalam satu tampilan</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm text-gray-600 font-medium">
                    Current Time: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Stats Overview (Optional Placeholder) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-sm font-medium text-gray-500 mb-2">Total Perangkat</div>
                    <div className="text-3xl font-bold text-gray-900">{devicesWithData.length}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-sm font-medium text-gray-500 mb-2">Sedang Berjalan</div>
                    <div className="text-3xl font-bold text-green-600">
                        {devicesWithData.filter(d => d.statusDisplay === 'Berjalan').length}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="text-sm font-medium text-gray-500 mb-2">Butuh Perhatian</div>
                    <div className="text-3xl font-bold text-orange-500">
                        0
                    </div>
                </div>
            </div>

            {/* Device Grid */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Daftar Alat</h2>
            </div>

            {devicesWithData.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg">Tidak ada alat terhubung saat ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devicesWithData.map((device) => (
                        <DeviceCard
                            key={device.id}
                            id={device.id}
                            name={device.name}
                            statusDisplay={device.statusDisplay}
                            statusColor={device.statusColor}
                            temp={device.temp}
                            ph={device.ph}
                            href={`/admin/device/${device.id}`}
                        />
                    ))}
                </div>
            )}
            <AutoRefresh />
        </div>
    );
}
