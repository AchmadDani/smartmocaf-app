import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DeviceDetailView from '@/components/DeviceDetailView';

export default async function DeviceDetailPage({ params }: { params: Promise<{ deviceId: string }> }) {
    const { deviceId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // 1. Fetch Device & Verify Owner
    const { data: device, error: deviceError } = await supabase
        .from('devices')
        .select('*')
        .eq('id', deviceId)
        .eq('owner_id', user.id)
        .single();

    if (deviceError || !device) {
        redirect('/devices');
    }

    // 2. Fetch Settings (create default if missing)
    let { data: settings } = await supabase
        .from('device_settings')
        .select('*')
        .eq('device_id', deviceId)
        .single();

    if (!settings) {
        // Auto-create default settings
        const { data: newSettings, error: createError } = await supabase
            .from('device_settings')
            .insert({
                device_id: deviceId,
                target_ph: 4.50,
                auto_drain_enabled: true
            })
            .select()
            .single();

        if (!createError) {
            settings = newSettings;
        } else {
            // Fallback if insertion fails for some reason (race condition etc)
            settings = { target_ph: 4.50, auto_drain_enabled: true };
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
        .select('ph, temp_c')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(1);

    return (
        <DeviceDetailView
            device={device}
            settings={settings}
            status={status}
            telemetry={telemetry?.[0] || null}
        />
    );
}
