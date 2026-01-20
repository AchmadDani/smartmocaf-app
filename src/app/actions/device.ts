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
    revalidatePath('/devices');
    return data;
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
    revalidatePath(`/devices/${deviceId}`);
}

export async function startFermentation(deviceId: string) {
    const supabase = await createClient();
    const userId = await getUserId();

    // Get current target_ph from settings to store in run
    const { data: settings } = await supabase
        .from('device_settings')
        .select('target_ph')
        .eq('device_id', deviceId)
        .single();

    // Check if there is already a running process? 
    // For simplicity, we assume the UI handles disabling, but good to check or just insert.
    // We'll just insert a new 'running' run.

    const { error } = await supabase
        .from('fermentation_runs')
        .insert({
            device_id: deviceId,
            status: 'running',
            target_ph: settings?.target_ph || 4.5,
            started_at: new Date().toISOString(),
            created_by: userId,
        });

    if (error) throw new Error(error.message);
    revalidatePath(`/devices/${deviceId}`);
    revalidatePath('/devices'); // Status changes in list too
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
    }

    revalidatePath(`/devices/${deviceId}`);
    revalidatePath('/devices');
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
    revalidatePath(`/devices/${deviceId}`);
    revalidatePath('/devices');
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

    revalidatePath('/devices');
}
