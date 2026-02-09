'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

// Helper to get authenticated user
async function getUserId() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }
    return user.id;
}

export async function createDevice(name: string, deviceCode: string) {
    const supabase = await createClient();
    const userId = await getUserId();

    // Check if device already exists (auto-discovered) but unowned
    const { data: existingDevice } = await supabase
        .from('devices')
        .select('id, owner_id')
        .eq('device_code', deviceCode)
        .maybeSingle();

    if (existingDevice) {
        if (existingDevice.owner_id && existingDevice.owner_id !== userId) {
            throw new Error('Alat ini sudah dimiliki oleh pengguna lain.');
        }

        // Claim existing device
        const { data, error } = await supabase
            .from('devices')
            .update({
                owner_id: userId,
                name: name,
            })
            .eq('id', existingDevice.id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        revalidatePath('/farmer');
        return data;
    }

    // Otherwise create new
    const { data, error } = await supabase
        .from('devices')
        .insert({
            owner_id: userId,
            name,
            device_code: deviceCode,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    revalidatePath('/farmer');
    revalidatePath('/admin');
    return data;
}

export async function createDeviceCommand(
    deviceId: string,
    command: string,
    payload: any,
    runId: number | null = null
) {
    const supabase = await createClient();
    const userId = await getUserId();

    // Verify ownership
    const { data: device } = await supabase
        .from('devices')
        .select('id')
        .eq('id', deviceId)
        .eq('owner_id', userId)
        .single();

    if (!device) throw new Error('Unauthorized or device not found');

    const { error } = await supabase
        .from('device_commands')
        .insert({
            device_id: deviceId,
            command,
            payload,
            status: 'queued',
            requested_by: userId,
            run_id: runId || null
        });

    if (error) throw new Error(error.message);
}

export async function updateDeviceSettings(deviceId: string, settings: { target_ph?: number; auto_drain_enabled?: boolean }) {
    const supabase = await createClient();
    await getUserId(); // ensure auth

    const { error } = await supabase
        .from('device_settings')
        .upsert({
            device_id: deviceId,
            ...settings,
            updated_at: new Date().toISOString(),
        });

    if (error) throw new Error(error.message);

    // Create command SETTINGS_UPDATE
    // We need to fetch the full settings to ensure we send the complete contract if needed,
    // or just send what we have + defaults. 
    // Contract says: target_ph, auto_drain_enabled, telemetry config.
    // For now we'll send the updated fields merge with defaults or fetching current state?
    // Let's fetch current state to be safe and accurate.
    const { data: currentSettings } = await supabase
        .from('device_settings')
        .select('target_ph, auto_drain_enabled')
        .eq('device_id', deviceId)
        .single();

    // Default telemetry config as per contract
    const telemetryConfig = {
        temp_interval_sec: 60,
        ph_interval_sec: 10800
    };

    await createDeviceCommand(deviceId, 'SETTINGS_UPDATE', {
        target_ph: currentSettings?.target_ph ?? 4.5,
        auto_drain_enabled: currentSettings?.auto_drain_enabled ?? false,
        telemetry: telemetryConfig
    });

    revalidatePath(`/farmer/${deviceId}`);
}

export async function manualDrainToggle(deviceId: string, open: boolean) {
    const supabase = await createClient();
    await getUserId();

    // Check if running - for logging/command purposes
    const { data: runningRun } = await supabase
        .from('fermentation_runs')
        .select('id, mode')
        .eq('device_id', deviceId)
        .eq('status', 'running')
        .single();

    // 1. Update source of truth (device_settings)
    const { error: updateError } = await supabase
        .from('device_settings')
        .update({
            auto_drain_enabled: open,
            updated_at: new Date().toISOString()
        })
        .eq('device_id', deviceId);

    if (updateError) throw new Error("Failed to update settings: " + updateError.message);

    // 2. Create Command with source tag
    const source = runningRun ? 'manual_override' : 'manual';
    await createDeviceCommand(
        deviceId, 
        open ? 'DRAIN_OPEN' : 'DRAIN_CLOSE', 
        { source, run_id: runningRun?.id }
    );

    revalidatePath(`/farmer/${deviceId}`);
}

export async function startFermentation(deviceId: string, mode: 'auto' | 'manual' = 'auto') {
    const supabase = await createClient();
    const userId = await getUserId();

    // Get current target_ph from settings to store in run
    const { data: settings } = await supabase
        .from('device_settings')
        .select('target_ph')
        .eq('device_id', deviceId)
        .single();

    const targetPh = settings?.target_ph || 4.5;

    // Get current water level for auto mode tracking
    const { data: latestTelemetry } = await supabase
        .from('telemetry')
        .select('water_level')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    const { data: newRun, error } = await supabase
        .from('fermentation_runs')
        .insert({
            device_id: deviceId,
            status: 'running',
            target_ph: targetPh,
            mode: mode,
            water_level_at_start: latestTelemetry?.water_level || null,
            started_at: new Date().toISOString(),
            created_by: userId,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    // Create RUN_START command
    await createDeviceCommand(deviceId, 'RUN_START', {
        target_ph: targetPh,
        mode: mode,
        telemetry: {
            temp_interval_sec: 60,
            ph_interval_sec: 10800,
            ph_near_target_interval_sec: 300,
            near_target_delta: 0.2
        }
    }, newRun.id);

    revalidatePath(`/farmer/${deviceId}`);
    revalidatePath('/farmer');
}

export async function stopFermentation(deviceId: string) {
    const supabase = await createClient();
    await getUserId();

    // Find the latest running process
    const { data: latestRun } = await supabase
        .from('fermentation_runs')
        .select('id')
        .eq('device_id', deviceId)
        .eq('status', 'running')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (latestRun) {
        const { error } = await supabase
            .from('fermentation_runs')
            .update({
                status: 'done',
                ended_at: new Date().toISOString(),
            })
            .eq('id', latestRun.id);

        if (error) throw new Error(error.message);

        // Create RUN_STOP command
        await createDeviceCommand(deviceId, 'RUN_STOP', { reason: 'user_stop' }, latestRun.id);
    }

    revalidatePath(`/farmer/${deviceId}`);
    revalidatePath('/farmer');
}

export async function simulateTelemetry(deviceId: string) {
    const supabase = await createClient();
    await getUserId();

    // Find active run if any (optional, can simulate without run)
    const { data: latestRun } = await supabase
        .from('fermentation_runs')
        .select('id')
        .eq('device_id', deviceId)
        .eq('status', 'running')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    // Generate random values
    const ph = +(Math.random() * (7 - 3) + 3).toFixed(2); // 3.00 - 7.00
    const temp = +(Math.random() * (35 - 25) + 25).toFixed(2); // 25.00 - 35.00

    const { error } = await supabase
        .from('telemetry')
        .insert({
            device_id: deviceId,
            run_id: latestRun?.id || null,
            ph,
            temp_c: temp,
        });

    if (error) throw new Error(error.message);
    revalidatePath(`/farmer/${deviceId}`);
    revalidatePath('/farmer');
}



export async function getRunTimeline(runId: string) {
    const supabase = await createClient();
    await getUserId(); // ensure auth

    const { data, error } = await supabase
        .from('telemetry')
        .select('ph, temp_c, created_at')
        .eq('run_id', runId)
        .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    if (!data || data.length === 0) return [];

    const timeline = [];
    let lastPh = null;

    for (const point of data) {
        if (lastPh === null || point.ph !== lastPh) {
            timeline.push(point);
            lastPh = point.ph;
        }
    }

    return timeline;
}

export async function deleteDevice(deviceId: string) {
    const supabase = await createClient();
    const userId = await getUserId();

    // Verify ownership
    const { data: device } = await supabase
        .from('devices')
        .select('id')
        .eq('id', deviceId)
        .eq('owner_id', userId)
        .single();

    if (!device) {
        throw new Error('Device not found or unauthorized');
    }

    // Delete device (Cascade should handle related tables like settings, telemetry, runs if configured, 
    // otherwise we might need to delete them manually. Assuming cascade or simple delete for now)
    const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', deviceId);

    if (error) throw new Error(error.message);

    revalidatePath('/farmer');
}
