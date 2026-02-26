import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DeviceDetailView from '@/components/farmer/DeviceDetailView';

export default async function DeviceDetailPage({ params }: { params: Promise<{ deviceId: string }> }) {
    const { deviceId } = await params;
    const session = await getSession();

    if (!session) {
        redirect('/auth/login');
    }

    // 1. Fetch Device & Verify Access
    const access = await prisma.deviceUser.findUnique({
        where: {
            deviceId_userId: {
                deviceId,
                userId: session.userId
            }
        },
        include: {
            device: {
                include: {
                    settings: true,
                    fermentationRuns: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    },
                    telemetry: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            }
        }
    });

    if (!access) {
        redirect('/farmer');
    }

    const device = access.device;

    // 2. Settings Management (Handled by upsert/ensure exists)
    let settings = device.settings;
    if (!settings) {
        settings = await prisma.deviceSettings.create({
            data: {
                deviceId,
                targetPh: 4.50,
                autoDrainEnabled: false
            }
        });
    }

    // 3. Status (latest run)
    const latestRun = device.fermentationRuns[0];
    const status = latestRun?.status || 'idle';

    // 4. Telemetry (Convert Decimals to Numbers for Client Component)
    const rawTelemetry = device.telemetry[0] || null;
    const telemetry = rawTelemetry ? {
        ph: Number(rawTelemetry.ph),
        temp_c: Number(rawTelemetry.tempC),
        water_level: rawTelemetry.waterLevel
    } : null;

    // 5. Fetch History (Completed fermentation runs)
    const historyRuns = await prisma.fermentationRun.findMany({
        where: { 
            deviceId,
            status: 'done' 
        },
        include: {
            telemetry: {
                orderBy: { createdAt: 'asc' }
            }
        },
        orderBy: { endedAt: 'desc' },
        take: 10
    });

    const history = historyRuns.map((run: any) => {
        const startTelem = run.telemetry[0];
        const endTelem = run.telemetry[run.telemetry.length - 1];

        return {
            id: run.id,
            name: run.name || 'Fermentasi',
            cassavaAmount: run.cassavaAmount || null,
            startedAt: run.startedAt,
            endedAt: run.endedAt,
            before: {
                ph: startTelem?.ph ? Number(startTelem.ph) : 0,
                temp: startTelem?.tempC ? Number(startTelem.tempC) : 0,
            },
            after: {
                ph: endTelem?.ph ? Number(endTelem.ph) : 0,
                temp: endTelem?.tempC ? Number(endTelem.tempC) : 0,
            }
        };
    });

    return (
        <DeviceDetailView
            device={{
                id: device.id,
                name: device.name,
                deviceCode: device.deviceCode,
                isOnline: device.isOnline,
                lastSeen: device.lastSeen
            } as any}
            settings={{
                target_ph: Number(settings.targetPh),
                auto_drain_enabled: settings.autoDrainEnabled,
                max_height: settings.maxHeight ?? 50,
                telegram_chat_id: settings.telegramChatId ?? '',
            } as any}
            status={status as any}
            telemetry={telemetry as any}
            history={history as any}
            role={access.role.toUpperCase() as 'OWNER' | 'VIEWER'}
        />
    );
}
