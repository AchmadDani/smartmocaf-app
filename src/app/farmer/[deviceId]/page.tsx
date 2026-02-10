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

    // 1. Fetch Device & Verify Owner
    const device = await prisma.device.findUnique({
        where: { 
            id: deviceId,
            userId: session.userId
        },
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
    });

    if (!device) {
        redirect('/farmer');
    }

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

    // 4. Telemetry
    const telemetry = device.telemetry[0] || null;

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
            startedAt: run.startedAt,
            endedAt: run.endedAt,
            before: {
                ph: startTelem?.ph || 0,
                temp: startTelem?.tempC || 0,
            },
            after: {
                ph: endTelem?.ph || 0,
                temp: endTelem?.tempC || 0,
            }
        };
    });

    return (
        <DeviceDetailView
            device={device as any}
            settings={settings as any}
            status={status}
            telemetry={telemetry as any}
            history={history as any}
        />
    );
}
