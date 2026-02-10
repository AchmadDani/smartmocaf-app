'use server';

import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
    const fullName = formData.get('full_name') as string;
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as any; // Cast to Role enum if necessary

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
        if (e.code === 'P2002') { // Prisma unique constraint error
            return { error: 'Username atau Email sudah terdaftar' };
        }
        return { error: e.message || 'Terjadi kesalahan server' };
    }
}

export async function deleteUser(userId: string) {
    if (!userId) return { error: 'User ID tidak valid' };

    try {
        await prisma.user.delete({
            where: { id: userId }
        });
        revalidatePath('/admin/users');
        return { success: true };
    } catch (e: any) {
        console.error('Error deleting user:', e);
        return { error: e.message || 'Terjadi kesalahan server' };
    }
}
