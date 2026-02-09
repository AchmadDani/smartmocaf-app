import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client (bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * MQTT Webhook Endpoint
 * 
 * This endpoint receives MQTT messages from EMQ X webhook bridge
 * and stores telemetry data in Supabase.
 * 
 * Expected payload format from IoT device:
 * {
 *   "device_id": "0001",
 *   "temp": 28.5,
 *   "ph": 4.52,
 *   "water_level": 85.0,
 *   "relay": 0,
 *   "mode": "auto",
 *   "datetime": "2026-01-29T08:00:00+07:00"
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // EMQ X webhook format or direct payload
        const payload = body.payload ? JSON.parse(body.payload) : body;
        const topic = body.topic || '';

        // Extract device_id from topic (growify/{device_id}/sensors) or payload
        let deviceCode = payload.device_id;
        if (!deviceCode && topic) {
            const topicParts = topic.split('/');
            if (topicParts.length >= 2) {
                deviceCode = topicParts[1];
            }
        }

        if (!deviceCode) {
            return NextResponse.json({ error: 'Missing device_id' }, { status: 400 });
        }

        // LOG STATUS: Update mqtt_status table
        await supabaseAdmin
            .from('mqtt_status')
            .upsert({
                id: 1,
                last_payload: payload,
                last_received_at: new Date().toISOString(),
                status: 'Receiving Data'
            });

        // Find device by device_code
        let { data: device, error: deviceError } = await supabaseAdmin
            .from('devices')
            .select('id')
            .eq('device_code', deviceCode)
            .single();

        if (deviceError || !device) {
            // AUTO-DISCOVERY: If device not registered, create a placeholder entry
            console.log(`Device ${deviceCode} not found, auto-registering as unassigned.`);
            const { data: newDevice, error: createError } = await supabaseAdmin
                .from('devices')
                .insert({
                    device_code: deviceCode,
                    name: `New Device ${deviceCode}`,
                    owner_id: null // Unassigned
                })
                .select('id')
                .single();

            if (createError) {
                console.error('Auto-registration failed:', createError);
                return NextResponse.json({ error: 'Failed to auto-register device' }, { status: 500 });
            }
            device = newDevice;
        }

        const deviceId = device.id;

        // Update device last_seen and is_online
        await supabaseAdmin
            .from('devices')
            .update({
                last_seen: new Date().toISOString(),
                is_online: true
            })
            .eq('id', deviceId);

        // Find active fermentation run if any
        const { data: activeRun } = await supabaseAdmin
            .from('fermentation_runs')
            .select('id')
            .eq('device_id', deviceId)
            .eq('status', 'running')
            .single();

        // Insert telemetry
        const { error: telemetryError } = await supabaseAdmin
            .from('telemetry')
            .insert({
                device_id: deviceId,
                run_id: activeRun?.id || null,
                temp_c: payload.temp,
                ph: payload.ph,
                water_level: payload.water_level
            });

        if (telemetryError) {
            console.error('Telemetry insert error:', telemetryError);
            return NextResponse.json({ error: 'Failed to insert telemetry' }, { status: 500 });
        }

        // Check for auto-drain conditions (if in auto mode and running)
        if (activeRun) {
            const { data: settings } = await supabaseAdmin
                .from('device_settings')
                .select('target_ph, auto_drain_enabled')
                .eq('device_id', deviceId)
                .single();

            const { data: runData } = await supabaseAdmin
                .from('fermentation_runs')
                .select('mode, target_ph')
                .eq('id', activeRun.id)
                .single();

            // Auto mode: Check if pH reached target
            if (runData?.mode === 'auto' && settings) {
                const targetPh = runData.target_ph || settings.target_ph;
                const currentPh = payload.ph;

                // If pH is at or below target (within 0.1 tolerance), trigger drain
                if (currentPh <= targetPh + 0.1 && !settings.auto_drain_enabled) {
                    // Update drain status
                    await supabaseAdmin
                        .from('device_settings')
                        .update({ auto_drain_enabled: true })
                        .eq('device_id', deviceId);

                    // Insert drain command
                    await supabaseAdmin
                        .from('device_commands')
                        .insert({
                            device_id: deviceId,
                            command: 'DRAIN_OPEN',
                            payload: { source: 'auto', reason: 'ph_target_reached' },
                            status: 'queued',
                            run_id: activeRun.id
                        });

                    console.log(`Auto drain triggered for device ${deviceCode} - pH ${currentPh} <= target ${targetPh}`);
                }
            }

            // Check for leak detection (water level dropping abnormally)
            // This would require historical comparison - simplified check here
            if (payload.water_level < 50 && runData?.mode === 'auto') {
                // Get previous water level
                const { data: prevTelemetry } = await supabaseAdmin
                    .from('telemetry')
                    .select('water_level, created_at')
                    .eq('device_id', deviceId)
                    .order('created_at', { ascending: false })
                    .limit(2);

                if (prevTelemetry && prevTelemetry.length >= 2) {
                    const prevLevel = prevTelemetry[1].water_level;
                    const currentLevel = payload.water_level;
                    const timeDiff = Date.now() - new Date(prevTelemetry[1].created_at).getTime();
                    
                    // If water dropped more than 10% in less than 1 minute, possible leak
                    if (prevLevel && (prevLevel - currentLevel) > 10 && timeDiff < 60000) {
                        await supabaseAdmin
                            .from('fermentation_runs')
                            .update({ leak_detected: true })
                            .eq('id', activeRun.id);

                        console.log(`Possible leak detected for device ${deviceCode}`);
                    }
                }
            }
        }

        return NextResponse.json({ 
            status: 'ok', 
            device_id: deviceId,
            device_code: deviceCode
        });

    } catch (error: any) {
        console.error('MQTT webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Mark offline devices
 * Called periodically to update devices that haven't sent data in 10 seconds
 */
export async function GET(request: NextRequest) {
    try {
        const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
        
        const { data, error } = await supabaseAdmin
            .from('devices')
            .update({ is_online: false })
            .lt('last_seen', tenSecondsAgo)
            .eq('is_online', true)
            .select('id, device_code');

        if (error) {
            console.error('Mark offline error:', error);
            return NextResponse.json({ error: 'Failed to mark devices offline' }, { status: 500 });
        }

        return NextResponse.json({ 
            status: 'ok', 
            marked_offline: data?.length || 0,
            devices: data
        });

    } catch (error: any) {
        console.error('Mark offline error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
