'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { usernameToEmail } from '@/lib/auth';

interface AuthFormProps {
    mode: 'LOGIN' | 'REGISTER';
}

export default function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const supabase = createClient();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [infoMsg, setInfoMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setInfoMsg(null);
        setLoading(true);

        const email = usernameToEmail(username);

        try {
            if (mode === 'LOGIN') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/devices');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { username },
                    },
                });
                if (error) throw error;
                // For Supabase, usually after sign up you might need to confirm email.
                // Assuming auto-confirm or no email verify for this local setup unless configured otherwise.
                // But generally, we can redirect or show success.
                // If "Email Confirm" is off, session is created and we can redirect.
                // However, let's keep the previous flow's logic: "Akun berhasil dibuat. Silakan masuk." logic was likely because of "Login" button needed to be pressed or just auto-login?
                // `signUp` returns a session if "Email Confirm" is disabled.

                // Let's stick to the previous behavior: redirect to login or show message?
                // The previous code showed "Akun berhasil dibuat. Silakan masuk." and switched mode to LOGIN.
                // Since we are splitting pages, we should redirect to /login or show a success message with link.

                setInfoMsg('Akun berhasil dibuat. Silakan masuk.');
                // Optional: router.push('/login');
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm">
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">SmartMocaf</h1>
            <p className="text-center text-gray-500 mb-8">
                {mode === 'LOGIN' ? 'Masuk untuk memantau perangkat' : 'Daftar akun baru'}
            </p>

            {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {errorMsg}
                </div>
            )}

            {infoMsg && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
                    {infoMsg}
                </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bd7e7e] focus:border-transparent outline-none text-black"
                        placeholder="petani01"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bd7e7e] focus:border-transparent outline-none text-black"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#bd7e7e] text-white font-medium py-2.5 rounded-lg hover:bg-[#a66b6b] transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Memproses...' : mode === 'LOGIN' ? 'Masuk' : 'Daftar'}
                </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
                {mode === 'LOGIN' ? (
                    <>
                        Belum punya akun?{' '}
                        <Link href="/register" className="text-[#bd7e7e] font-medium hover:underline focus:outline-none">
                            Daftar Sekarang
                        </Link>
                    </>
                ) : (
                    <>
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-[#bd7e7e] font-medium hover:underline focus:outline-none">
                            Masuk
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
