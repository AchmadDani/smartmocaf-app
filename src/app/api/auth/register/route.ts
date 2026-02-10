import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

/**
 * Register User dengan Prisma (MySQL)
 * 
 * POST /api/auth/register
 * Body: { fullName, username, email, password }
 */
export async function POST(request: NextRequest) {
    try {
        const { fullName, username, email, password } = await request.json();

        // Validasi input
        if (!fullName || !username || !email || !password) {
            return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
        }

        // Cek apakah username atau email sudah dipakai
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: email }
                ]
            }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Username atau Email sudah digunakan' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Buat user di tabel users
        const newUser = await prisma.user.create({
            data: {
                fullName,
                username,
                email,
                passwordHash: hashedPassword,
                role: 'farmer'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Akun berhasil dibuat!',
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username
            }
        });

    } catch (error: any) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
