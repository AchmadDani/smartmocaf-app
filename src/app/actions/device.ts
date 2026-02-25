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

// Helper to check if user has access to device
async function checkDeviceAccess(deviceId: string, requiredRole: 'owner' | 'viewer' = 'viewer') {
    const userId = await getUserId();
    
    // Admin has access to all
    const userProfile = await prisma.user.findUnique({ 
        where: { id: userId },
        select: { role: true }
    });
    
    if (userProfile?.role === 'admin') return userId;

    const access = await prisma.deviceUser.findUnique({
        where: { deviceId_userId: { deviceId, userId } }
    });

    if (!access) throw new Error('Unauthorized or device not found');
    
    if (requiredRole === 'owner' && access.role !== 'owner') {
        throw new Error('Hanya pemilik yang dapat melakukan aksi ini');
    }

    return userId;
}

export async function createDevice(name: string, deviceCode: string) {
    const userId = await getUserId();

    // Find device registered by admin
    const existingDevice = await prisma.device.findUnique({
        where: { deviceCode },
        include: { 
            _count: { select: { deviceUsers: true } }
        }
    });

    if (!existingDevice) {
        throw new Error('Perangkat tidak ditemukan');
    }

    // Check if user already has access
    const existingAccess = await prisma.deviceUser.findUnique({
        where: { deviceId_userId: { deviceId: existingDevice.id, userId } }
    });

    if (existingAccess) {
        throw new Error('Anda sudah memiliki akses ke perangkat ini.');
    }

    // Check limit
    if (existingDevice._count.deviceUsers >= existingDevice.maxUsers) {
        throw new Error('Batas pengguna untuk perangkat ini sudah penuh. Silakan hubungi admin.');
    }

    // Add user as owner (if first user) or viewer
    const role = existingDevice._count.deviceUsers === 0 ? 'owner' : 'viewer';

    await prisma.deviceUser.create({
        data: {
            deviceId: existingDevice.id,
            userId,
            role
        }
    });

    // Log activity
    await prisma.deviceActivity.create({
        data: {
            deviceId: existingDevice.id,
            userId,
            action: 'DEVICE_CLAIMED',
            detail: { role }
        }
    });

    revalidatePath('/farmer');
    revalidatePath('/admin/devices');
    revalidatePath(`/admin/devices/${existingDevice.id}`);
    return { id: existingDevice.id };
}

export async function createDeviceCommand(
    deviceId: string,
    command: string,
    payload: any,
    runId: string | null = null
) {
    const userId = await checkDeviceAccess(deviceId, 'owner');

    await prisma.deviceCommand.create({
        data: {
            deviceId,
            command,
            payload,
            status: 'queued'
        }
    });
}

export async function updateDeviceSettings(deviceId: string, settings: { target_ph?: number; auto_drain_enabled?: boolean; max_height?: number; telegram_chat_id?: string }) {
    const userId = await checkDeviceAccess(deviceId, 'owner');

    const updateData: any = {};
    if (settings.target_ph !== undefined) updateData.targetPh = settings.target_ph;
    if (settings.auto_drain_enabled !== undefined) updateData.autoDrainEnabled = settings.auto_drain_enabled;
    if (settings.max_height !== undefined) updateData.maxHeight = settings.max_height;
    if (settings.telegram_chat_id !== undefined) updateData.telegramChatId = settings.telegram_chat_id;

    const currentSettings = await prisma.deviceSettings.upsert({
        where: { deviceId },
        update: updateData,
        create: {
            deviceId,
            targetPh: settings.target_ph ?? 4.5,
            autoDrainEnabled: settings.auto_drain_enabled ?? false,
            maxHeight: settings.max_height ?? 50,
            telegramChatId: settings.telegram_chat_id ?? null,
        }
    });

    // Log activity
    await prisma.deviceActivity.create({
        data: {
            deviceId,
            userId,
            action: 'SETTINGS_UPDATE',
            detail: settings
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
        max_height: currentSettings.maxHeight,
        telegram_chat_id: currentSettings.telegramChatId,
        telemetry: telemetryConfig
    });

    revalidatePath(`/farmer/${deviceId}`);
    revalidatePath(`/admin/devices/${deviceId}`);
}

export async function manualDrainToggle(deviceId: string, open: boolean) {
    const userId = await checkDeviceAccess(deviceId, 'owner');

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

    // 2. Log activity
    await prisma.deviceActivity.create({
        data: {
            deviceId,
            userId,
            action: open ? 'DRAIN_OPEN' : 'DRAIN_CLOSE',
            detail: { source: 'manual' }
        }
    });

    // 3. Create Command with source tag
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
    const userId = await checkDeviceAccess(deviceId, 'owner');

    // Get current target_ph from settings
    const settings = await prisma.deviceSettings.findUnique({
        where: { deviceId }
    });
    const targetPh = settings?.targetPh ?? 4.5;

    const newRun = await prisma.fermentationRun.create({
        data: {
            deviceId,
            status: 'running',
            mode: mode as any,
            startedAt: new Date()
        }
    });

    // Log activity
    await prisma.deviceActivity.create({
        data: {
            deviceId,
            userId,
            action: 'START_FERMENTATION',
            detail: { mode, targetPh, runId: newRun.id }
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
    const userId = await checkDeviceAccess(deviceId, 'owner');

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

        // Log activity
        await prisma.deviceActivity.create({
            data: {
                deviceId,
                userId,
                action: 'STOP_FERMENTATION',
                detail: { runId: latestRun.id }
            }
        });

        // Create RUN_STOP command
        await createDeviceCommand(deviceId, 'RUN_STOP', { reason: 'user_stop' }, latestRun.id);
    }

    revalidatePath(`/farmer/${deviceId}`);
    revalidatePath('/farmer');
}

export async function simulateTelemetry(deviceId: string) {
    await checkDeviceAccess(deviceId, 'owner');

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
    // Only admin usually deletes devices via admin actions, 
    // but if we allow farmers to "un-claim", it's different.
    // Farmer delete device = remove their own DeviceUser entry.
    const userId = await getUserId();

    await prisma.deviceUser.delete({
        where: {
            deviceId_userId: { deviceId, userId }
        }
    });

    revalidatePath('/farmer');
}

