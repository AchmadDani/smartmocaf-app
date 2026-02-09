import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DeviceDetailView from '@/components/farmer/DeviceDetailView';

export default async function DeviceDetailPage({ params }: { params: Promise<{ deviceId: string }> }) {
    const { deviceId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // 1. Fetch Device & Verify Owner
    const { data: device, error: deviceError } = await supabase
        .from('devices')
        .select('*')
        .eq('id', deviceId)
        .eq('owner_id', user.id)
        .single();

    if (deviceError || !device) {
        redirect('/farmer');
    }

    // 2. Fetch Settings (create default if missing)
    let { data: settings } = await supabase
        .from('device_settings')
        .select('*')
        .eq('device_id', deviceId)
        .single();

    if (!settings) {
        const { data: newSettings, error: createError } = await supabase
            .from('device_settings')
            .insert({
                device_id: deviceId,
                target_ph: 4.50,
                auto_drain_enabled: false
            })
            .select()
            .single();

        if (!createError) {
            settings = newSettings;
        } else {
            settings = { target_ph: 4.50, auto_drain_enabled: false };
        }
    }

    // 3. Fetch Status (latest run)
    const { data: runs } = await supabase
        .from('fermentation_runs')
        .select('status')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(1);

    const status = runs?.[0]?.status || 'idle';

    // 4. Fetch Telemetry
    const { data: telemetry } = await supabase
        .from('telemetry')
        .select('ph, temp_c, water_level')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(1);

    // 5. Fetch History (Completed fermentation runs)
    const { data: historyRuns } = await supabase
        .from('fermentation_runs')
        .select('*')
        .eq('status', 'done')
        .eq('device_id', deviceId)
        .order('ended_at', { ascending: false })
        .limit(10);

    const history = await Promise.all((historyRuns || []).map(async (run) => {
        const { data: startTelem } = await supabase
            .from('telemetry')
            .select('ph, temp_c')
            .eq('run_id', run.id)
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        const { data: endTelem } = await supabase
            .from('telemetry')
            .select('ph, temp_c')
            .eq('run_id', run.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        return {
            id: run.id,
            startedAt: run.started_at,
            endedAt: run.ended_at,
            before: {
                ph: startTelem?.ph || 0,
                temp: startTelem?.temp_c || 0,
            },
            after: {
                ph: endTelem?.ph || 0,
                temp: endTelem?.temp_c || 0,
            }
        };
    }));

    return (
        <DeviceDetailView
            device={device}
            settings={settings}
            status={status}
            telemetry={telemetry?.[0] || null}
            history={history}
        />
    );
}
