'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { usernameToEmail } from '@/lib/auth';

// NOTE: This usually requires SUPABASE_SERVICE_ROLE_KEY to work properly 
// without checking the current user's session (or to allow creating users without logging out).
// Using process.env.SUPABASE_SERVICE_ROLE_KEY if available, otherwise falling back might fail if not admin.

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function createUser(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;

    if (!username || !password || !role) {
        return { error: 'Semua field harus diisi' };
    }

    const email = usernameToEmail(username);

    try {
        // 1. Create User in Auth
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { username }
        });

        if (error) {
            console.error('Error creating user:', error);
            // Fallback for "standard" client if admin api fails (unlikely if service key is wrong, but good to catch)
            return { error: error.message };
        }

        if (data.user) {
            // 2. Insert into Profiles
            // We use supabaseAdmin to bypass RLS potentially, ensuring insert works
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        full_name: username,
                        role: role
                    }
                ]);

            if (profileError) {
                console.error('Error creating profile:', profileError);
                // Clean up auth user if profile fails? 
                // For now just return error
                return { error: 'User created but profile failed: ' + profileError.message };
            }
        }

        revalidatePath('/admin/users');
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'Terjadi kesalahan server' };
    }
}
