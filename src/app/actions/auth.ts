'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/auth/login');
}

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Admin client for user lookups (bypasses RLS if needed, but we rely on profiles table mainly)
const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function signInWithUsername(prevState: any, formData: FormData) {
    const identifier = formData.get('identifier') as string;
    const password = formData.get('password') as string;

    if (!identifier || !password) {
        return { error: 'Username/Email dan Password harus diisi.' };
    }

    const supabase = await createClient();
    let loginEmail = identifier;
    let loginSuccess = false;

    // 1. Try direct login (email or full username@smartmocaf.local)
    const { error: error1 } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
    });
    
    if (!error1) {
        loginSuccess = true;
    }

    // 2. If failed and no @ in identifier, try constructed email
    if (!loginSuccess && !identifier.includes('@')) {
        loginEmail = `${identifier}@smartmocaf.local`;
        const { error: error2 } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password
        });
        if (!error2) {
            loginSuccess = true;
        }
    }

    // 3. If still failed, look up email from profiles via username
    if (!loginSuccess && !identifier.includes('@')) {
        const { data: profileLookup } = await supabaseAdmin
            .from('profiles')
            .select('email')
            .eq('username', identifier)
            .single();
        
        if (profileLookup?.email) {
            const { error: error3 } = await supabase.auth.signInWithPassword({
                email: profileLookup.email,
                password
            });
            if (!error3) {
                loginSuccess = true;
            }
        }
    }

    if (!loginSuccess) {
        return { error: 'Username atau Password salah.' };
    }

    // Get user and determine role using ADMIN client (bypasses RLS)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Gagal mendapatkan data pengguna.' };
    }
    
    // Use admin client to query profile role (bypasses RLS for accurate lookup)
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    const redirectUrl = profile?.role === 'admin' ? '/admin' : '/farmer';
    
    return { success: true, redirectUrl };
}
