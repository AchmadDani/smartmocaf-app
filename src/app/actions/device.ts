'use server';

import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Helper to get authenticated user
async function getUserId() {
    const session = await getSession();
    if (!session) {
        throw new Error('Unauthorized');
    }
    return session.userId;
}

export async function createDevice(name: string, deviceCode: string) {
    const userId = await getUserId();

    // Check if device already exists (auto-discovered) but unowned
    const existingDevice = await prisma.device.findUnique({
        where: { deviceCode }
    });

    if (existingDevice) {
        if (existingDevice.userId && existingDevice.userId !== userId) {
            throw new Error('Alat ini sudah dimiliki oleh pengguna lain.');
        }

        // Claim existing device
        await prisma.device.update({
            where: { id: existingDevice.id },
            data: {
                userId,
                name
            }
        });

        revalidatePath('/farmer');
        return { id: existingDevice.id };
    }

    // Otherwise create new
    const newDevice = await prisma.device.create({
        data: {
            name,
            deviceCode,
            userId
        }
    });

    revalidatePath('/farmer');
    revalidatePath('/admin');
    return { id: newDevice.id };
}

export async function createDeviceCommand(
    deviceId: string,
    command: string,
    payload: any,
    runId: string | null = null
) {
    const userId = await getUserId();

    // Verify ownership
    const device = await prisma.device.findUnique({
        where: {
            id: deviceId,
            userId: userId
        }
    });

    if (!device) throw new Error('Unauthorized or device not found');

    await prisma.deviceCommand.create({
        data: {
            deviceId,
            command,
            payload,
            status: 'queued'
        }
    });
}

export async function updateDeviceSettings(deviceId: string, settings: { target_ph?: number; auto_drain_enabled?: boolean }) {
    await getUserId(); // ensure auth

    const currentSettings = await prisma.deviceSettings.upsert({
        where: { deviceId },
        update: {
            targetPh: settings.target_ph,
            autoDrainEnabled: settings.auto_drain_enabled
        },
        create: {
            deviceId,
            targetPh: settings.target_ph ?? 4.5,
            autoDrainEnabled: settings.auto_drain_enabled ?? false
        }
    });

    // Default telemetry config as per contract
    const telemetryConfig = {
        temp_interval_sec: 60,
        ph_interval_sec: 10800
    };

    await createDeviceCommand(deviceId, 'SETTINGS_UPDATE', {
        target_ph: Number(currentSettings.targetPh),
        auto_drain_enabled: currentSettings.autoDrainEnabled,
        telemetry: telemetryConfig
    });

    revalidatePath(`/farmer/${deviceId}`);
}

export async function manualDrainToggle(deviceId: string, open: boolean) {
    await getUserId();

    // Check if running
    const runningRun = await prisma.fermentationRun.findFirst({
        where: {
            deviceId,
            status: 'running'
        }
    });

    // 1. Update source of truth
    await prisma.deviceSettings.update({
        where: { deviceId },
        data: { autoDrainEnabled: open }
    });

    // 2. Create Command with source tag
    const source = runningRun ? 'manual_override' : 'manual';
    await createDeviceCommand(
        deviceId, 
        open ? 'DRAIN_OPEN' : 'DRAIN_CLOSE', 
        { source, run_id: runningRun?.id },
        runningRun?.id
    );

    revalidatePath(`/farmer/${deviceId}`);
}

export async function startFermentation(deviceId: string, mode: 'auto' | 'manual' = 'auto') {
    const userId = await getUserId();

    // Get current target_ph from settings
    const settings = await prisma.deviceSettings.findUnique({
        where: { deviceId }
    });
    const targetPh = settings?.targetPh ?? 4.5;

    // Get current water level
    const latestTelemetry = await prisma.telemetry.findFirst({
        where: { deviceId },
        orderBy: { createdAt: 'desc' }
    });
    const waterLevel = latestTelemetry?.waterLevel || null;

    const newRun = await prisma.fermentationRun.create({
        data: {
            deviceId,
            status: 'running',
            mode: mode as any,
            startedAt: new Date()
        }
    });

    // Create RUN_START command
    await createDeviceCommand(deviceId, 'RUN_START', {
        target_ph: Number(targetPh),
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
    await getUserId();

    const latestRun = await prisma.fermentationRun.findFirst({
        where: {
            deviceId,
            status: 'running'
        },
        orderBy: { createdAt: 'desc' }
    });

    if (latestRun) {
        await prisma.fermentationRun.update({
            where: { id: latestRun.id },
            data: {
                status: 'done',
                endedAt: new Date()
            }
        });

        // Create RUN_STOP command
        await createDeviceCommand(deviceId, 'RUN_STOP', { reason: 'user_stop' }, latestRun.id);
    }

    revalidatePath(`/farmer/${deviceId}`);
    revalidatePath('/farmer');
}

export async function simulateTelemetry(deviceId: string) {
    await getUserId();

    const latestRun = await prisma.fermentationRun.findFirst({
        where: {
            deviceId,
            status: 'running'
        },
        orderBy: { createdAt: 'desc' }
    });

    // Generate random values
    const ph = +(Math.random() * (7 - 3) + 3).toFixed(2); // 3.00 - 7.00
    const temp = +(Math.random() * (35 - 25) + 25).toFixed(2); // 25.00 - 35.00

    await prisma.telemetry.create({
        data: {
            deviceId,
            runId: latestRun?.id || null,
            ph,
            tempC: temp,
            waterLevel: 80 // Default for simulation
        }
    });

    revalidatePath(`/farmer/${deviceId}`);
    revalidatePath('/farmer');
}

export async function getRunTimeline(runId: string) {
    await getUserId(); // ensure auth

    const data = await prisma.telemetry.findMany({
        where: { runId },
        orderBy: { createdAt: 'asc' },
        select: {
            ph: true,
            tempC: true,
            createdAt: true
        }
    });

    if (!data || data.length === 0) return [];

    const timeline = [];
    let lastPh = null;

    for (const point of data) {
        if (lastPh === null || Number(point.ph) !== lastPh) {
            timeline.push(point);
            lastPh = Number(point.ph);
        }
    }

    return timeline;
}

export async function deleteDevice(deviceId: string) {
    const userId = await getUserId();

    // Verify ownership
    const device = await prisma.device.findUnique({
        where: {
            id: deviceId,
            userId: userId
        }
    });

    if (!device) {
        throw new Error('Device not found or unauthorized');
    }

    await prisma.device.delete({
        where: { id: deviceId }
    });

    revalidatePath('/farmer');
}
