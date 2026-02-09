'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function createUser(formData: FormData) {
    const fullName = formData.get('full_name') as string;
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    if (!fullName || !username || !email || !password || !role) {
        return { error: 'Semua field harus diisi' };
    }

    try {
        // 1. Create User in Auth
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { 
                username,
                full_name: fullName
            }
        });

        if (error) {
            console.error('Error creating user:', error);
            return { error: error.message };
        }

        if (data.user) {
            // 2. Insert into Profiles
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        full_name: fullName,
                        username: username,
                        role: role
                    }
                ]);

            if (profileError) {
                console.error('Error creating profile:', profileError);
                return { error: 'User created but profile failed: ' + profileError.message };
            }
        }

        revalidatePath('/admin/users');
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'Terjadi kesalahan server' };
    }
}

export async function deleteUser(userId: string) {
    if (!userId) return { error: 'User ID tidak valid' };

    try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (error) {
            console.error('Error deleting user:', error);
            return { error: error.message };
        }

        revalidatePath('/admin/users');
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'Terjadi kesalahan server' };
    }
}
