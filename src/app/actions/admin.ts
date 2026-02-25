'use server';

import prisma from '@/lib/prisma';
import { hashPassword, getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Helper: ensure caller is admin
async function requireAdmin() {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
    if (user?.role !== 'admin') throw new Error('Forbidden');
    return session.userId;
}

export async function createUser(formData: FormData) {
    await requireAdmin();

    const fullName = formData.get('full_name') as string;
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as any;

    if (!fullName || !username || !email || !password || !role) {
        return { error: 'Semua field harus diisi' };
    }

    try {
        const hashedPassword = await hashPassword(password);

        await prisma.user.create({
            data: {
                fullName,
                username,
                email,
                passwordHash: hashedPassword,
                role: role
            }
        });

        revalidatePath('/admin/users');
        return { success: true };
    } catch (e: any) {
        console.error('Error creating user:', e);
        if (e.code === 'P2002') {
            return { error: 'Username atau Email sudah terdaftar' };
        }
        return { error: e.message || 'Terjadi kesalahan server' };
    }
}

export async function deleteUser(userId: string) {
    await requireAdmin();
    if (!userId) return { error: 'User ID tidak valid' };

    try {
        await prisma.user.delete({ where: { id: userId } });
        revalidatePath('/admin/users');
        revalidatePath('/admin/devices'); // In case they were connected to devices
        return { success: true };
    } catch (e: any) {
        console.error('Error deleting user:', e);
        return { error: e.message || 'Terjadi kesalahan server' };
    }
}

export async function toggleUserActive(userId: string, isActive: boolean) {
    await requireAdmin();
    if (!userId) return { error: 'User ID tidak valid' };

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { isActive }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (e: any) {
        console.error('Error toggling user:', e);
        return { error: e.message || 'Terjadi kesalahan server' };
    }
}

// ── Admin Device Management ──────────────────────────────────────────

export async function adminCreateDevice(name: string, deviceCode: string) {
    await requireAdmin();

    if (!name || !deviceCode) {
        return { error: 'Nama dan kode perangkat harus diisi' };
    }

    try {
        // Check if device code already exists
        const existing = await prisma.device.findUnique({ where: { deviceCode } });
        if (existing) {
            return { error: 'Kode perangkat sudah terdaftar' };
        }

        const device = await prisma.device.create({
            data: {
                name,
                deviceCode,
                userId: null // no owner yet
            }
        });

        revalidatePath('/admin/devices');
        revalidatePath('/admin');
        return { success: true, id: device.id };
    } catch (e: any) {
        console.error('Error creating device:', e);
        if (e.code === 'P2002') {
            return { error: 'Kode perangkat sudah terdaftar' };
        }
        return { error: e.message || 'Terjadi kesalahan server' };
    }
}

export async function adminDeleteDevice(deviceId: string) {
    await requireAdmin();

    try {
        await prisma.device.delete({ where: { id: deviceId } });
        revalidatePath('/admin/devices');
        revalidatePath('/admin');
        revalidatePath('/farmer');
        return { success: true };
    } catch (e: any) {
        console.error('Error deleting device:', e);
        return { error: e.message || 'Terjadi kesalahan server' };
    }
}

export async function adminUpdateDeviceMaxUsers(deviceId: string, maxUsers: number) {
    await requireAdmin();
    if (!deviceId || maxUsers < 1) return { error: 'Invalid data' };

    try {
        await prisma.device.update({
            where: { id: deviceId },
            data: { maxUsers }
        });
        revalidatePath(`/admin/devices/${deviceId}`);
        return { success: true };
    } catch (e: any) {
        return { error: 'Gagal memperbarui limit user' };
    }
}

export async function adminRemoveDeviceUser(deviceId: string, userId: string) {
    await requireAdmin();
    try {
        await prisma.deviceUser.delete({
            where: {
                deviceId_userId: { deviceId, userId }
            }
        });
        
        // Log activity
        await prisma.deviceActivity.create({
            data: {
                deviceId,
                action: 'USER_REMOVED',
                detail: { targetUserId: userId }
            }
        });

        revalidatePath(`/admin/devices/${deviceId}`);
        revalidatePath('/farmer');
        return { success: true };
    } catch (e: any) {
        return { error: 'Gagal melepas pengguna' };
    }
}

export async function adminAddDeviceUser(deviceId: string, userId: string, role: 'owner' | 'viewer' = 'viewer') {
    await requireAdmin();
    try {
        // Check limit
        const device = await prisma.device.findUnique({
            where: { id: deviceId },
            include: { _count: { select: { deviceUsers: true } } }
        });

        if (device && device._count.deviceUsers >= device.maxUsers) {
            return { error: `Batas pengguna (${device.maxUsers}) sudah tercapai.` };
        }

        await prisma.deviceUser.upsert({
            where: { deviceId_userId: { deviceId, userId } },
            update: { role },
            create: { deviceId, userId, role }
        });

        // Log activity
        await prisma.deviceActivity.create({
            data: {
                deviceId,
                userId: null, // Admin action
                action: 'USER_ADDED',
                detail: { targetUserId: userId, role }
            }
        });

        revalidatePath(`/admin/devices/${deviceId}`);
        revalidatePath('/farmer');
        return { success: true };
    } catch (e: any) {
        return { error: 'Gagal menambahkan pengguna' };
    }
}

export async function adminLogActivity(deviceId: string, action: string, detail: any) {
    await requireAdmin();
    try {
        await prisma.deviceActivity.create({
            data: {
                deviceId,
                action,
                detail
            }
        });
        revalidatePath(`/admin/devices/${deviceId}`);
        return { success: true };
    } catch (e: any) {
        console.error('Error logging admin activity:', e);
        return { error: 'Gagal mencatat aktivitas' };
    }
}

