
import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import DeviceDetailView from '@/components/DeviceDetailView';
import AutoRefresh from '@/components/AutoRefresh';

export const revalidate = 0; // Disable caching

interface PageProps {
    params: {
        id: string;
    };
}

export default async function AdminDevicePage({ params }: PageProps) {
    const supabase = await createClient();
    const { id } = params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Role check (Simplified, ideally middleware handles this too)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') redirect('/devices');


    // 1. Fetch Device
    const { data: device, error: deviceError } = await supabase
        .from('devices')
        .select('*')
        .eq('id', id)
        .single();

    if (deviceError || !device) {
        return notFound();
    }

    // 2. Fetch Device Settings
    const { data: settings } = await supabase
        .from('device_settings')
        .select('*')
        .eq('device_id', id)
        .single();

    // 3. Fetch Latest Run (to determine status)
    const { data: runs } = await supabase
        .from('fermentation_runs')
        .select('*')
        .eq('device_id', id)
        .order('created_at', { ascending: false })
        .limit(1);

    const latestRun = runs?.[0];
    let status: 'idle' | 'running' | 'done' = 'idle';

    if (latestRun?.status === 'running') {
        status = 'running';
    } else if (latestRun?.status === 'done') {
        status = 'done';
    }

    // 4. Fetch Latest Telemetry
    const { data: telemetries } = await supabase
        .from('telemetry')
        .select('ph, temp_c, created_at')
        .eq('device_id', id)
        .order('created_at', { ascending: false })
        .limit(1);

    const latestTelemetry = telemetries?.[0];

    // 5. Fetch History (Completed Runs)
    // We can fetch last 5 runs for the history tab
    const { data: history } = await supabase
        .from('fermentation_runs')
        .select('*')
        .eq('device_id', id)
        .eq('status', 'done')
        .order('end_time', { ascending: false })
        .limit(10);

    return (
        <div className="w-full">
            <DeviceDetailView
                device={device}
                settings={settings || { target_ph: 4.5, auto_drain_enabled: false }}
                telemetry={latestTelemetry}
                status={status}
                history={history || []}
                readonly={true} // Strict Monitoring Mode
            />
            <AutoRefresh />
        </div>
    );
}
