import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client untuk bypass email confirmation
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

/**
 * Register User dengan Auto-Confirm Email
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

        // Cek apakah username sudah dipakai
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('username')
            .eq('username', username)
            .single();

        if (existingProfile) {
            return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
        }

        // Buat user dengan admin API (auto-confirm email)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                full_name: fullName,
                username: username
            }
        });

        if (authError) {
            console.error('Auth error:', authError);
            
            // Handle specific errors
            if (authError.message.includes('already been registered')) {
                return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
            }
            
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'Gagal membuat akun' }, { status: 500 });
        }

        // Buat profile di tabel profiles
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: authData.user.id,
                full_name: fullName,
                username: username,
                role: 'farmer'
            });

        if (profileError) {
            console.error('Profile error:', profileError);
            // Hapus user jika profile gagal dibuat
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json({ error: 'Gagal membuat profil' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Akun berhasil dibuat!',
            user: {
                id: authData.user.id,
                email: authData.user.email,
                username: username
            }
        });

    } catch (error: any) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
}
