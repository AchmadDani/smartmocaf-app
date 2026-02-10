'use server';

import prisma from '@/lib/prisma';
import { comparePassword, createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function signOut() {
    await deleteSession();
    redirect('/auth/login');
}

export async function signInWithUsername(prevState: any, formData: FormData) {
    const identifier = formData.get('identifier') as string;
    const password = formData.get('password') as string;

    if (!identifier || !password) {
        return { error: 'Username/Email dan Password harus diisi.' };
    }

    // 1. Find user by email or username
    let user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: identifier },
                { username: identifier }
            ]
        }
    });

    if (!user) {
        // If not found, try fallback smartmocaf.local email if it looks like a username
        if (!identifier.includes('@')) {
            const fallbackEmail = `${identifier}@smartmocaf.local`;
            user = await prisma.user.findUnique({
                where: { email: fallbackEmail }
            });
        }
    }

    if (!user) {
        return { error: 'Username atau Password salah.' };
    }

    // 2. Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
        return { error: 'Username atau Password salah.' };
    }

    // 3. Create session
    await createSession(user.id, user.role);

    const redirectUrl = user.role === 'admin' ? '/admin' : '/farmer';
    
    return { success: true, redirectUrl };
}
