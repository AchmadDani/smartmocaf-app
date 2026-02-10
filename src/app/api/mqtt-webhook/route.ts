import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * MQTT Webhook Endpoint
 * 
 * This endpoint receives MQTT messages from EMQ X webhook bridge
 * and stores telemetry data in MySQL.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // EMQ X webhook format or direct payload
        const payload = body.payload ? JSON.parse(body.payload) : body;
        const topic = body.topic || '';

        // Extract device_id from topic or payload
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
        await prisma.mqttStatus.upsert({
            where: { topic: topic || 'global' },
            create: {
                topic: topic || 'global',
                message: JSON.stringify(payload)
            },
            update: {
                message: JSON.stringify(payload)
            }
        });

        // Find device by deviceCode
        let device = await prisma.device.findUnique({
            where: { deviceCode }
        });

        if (!device) {
            // AUTO-DISCOVERY
            console.log(`Device ${deviceCode} not found, auto-registering as unassigned.`);
            device = await prisma.device.create({
                data: {
                    deviceCode,
                    name: `New Device ${deviceCode}`,
                    userId: null
                }
            });
        }

        // Update device last_seen and isOnline
        await prisma.device.update({
            where: { id: device.id },
            data: {
                lastSeen: new Date(),
                isOnline: true
            }
        });

        // Find active fermentation run if any
        const activeRun = await prisma.fermentationRun.findFirst({
            where: {
                deviceId: device.id,
                status: 'running'
            }
        });

        // 📝 DATA LOGGING CONCEPT:
        // 1. Only log to DB if fermentation is active (activeRun exists)
        // 2. Log exactly once every 30 minutes to keep history tidy
        if (activeRun) {
            const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
            const lastTelemetry = await prisma.telemetry.findFirst({
                where: { runId: activeRun.id },
                orderBy: { createdAt: 'desc' }
            });

            // Save if first record for batch OR last record is older than 30 mins
            if (!lastTelemetry || lastTelemetry.createdAt < thirtyMinutesAgo) {
                await prisma.telemetry.create({
                    data: {
                        deviceId: device.id,
                        runId: activeRun.id,
                        tempC: payload.temp,
                        ph: payload.ph,
                        waterLevel: Math.round(payload.water_level || 0)
                    }
                });
            }

            // Always check for auto-drain conditions if batched
            const settings = await prisma.deviceSettings.findUnique({
                where: { deviceId: device.id }
            });

            if (activeRun.mode === 'auto' && settings) {
                const targetPh = Number(settings.targetPh);
                const currentPh = payload.ph;

                if (currentPh <= targetPh + 0.1 && !settings.autoDrainEnabled) {
                    await prisma.deviceSettings.update({
                        where: { deviceId: device.id },
                        data: { autoDrainEnabled: true }
                    });

                    await prisma.deviceCommand.create({
                        data: {
                            deviceId: device.id,
                            command: 'DRAIN_OPEN',
                            payload: { source: 'auto', reason: 'ph_target_reached', run_id: activeRun.id },
                            status: 'queued'
                        }
                    });
                }
            }
        }

        return NextResponse.json({ 
            status: 'ok', 
            device_id: device.id,
            device_code: deviceCode
        });

    } catch (error: any) {
        console.error('MQTT webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Mark offline devices
 */
export async function GET(request: NextRequest) {
    try {
        // Find devices that haven't sent data in 10 seconds
        const tenSecondsAgo = new Date(Date.now() - 10000);
        
        const result = await prisma.device.updateMany({
            where: {
                lastSeen: {
                    lt: tenSecondsAgo
                },
                isOnline: true
            },
            data: {
                isOnline: false
            }
        });

        return NextResponse.json({ 
            status: 'ok', 
            marked_offline: result.count
        });

    } catch (error: any) {
        console.error('Mark offline error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
