'use client';

import { signInWithUsername } from '@/app/actions/auth';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { showSuccess, showError, showLoading, closeSwal } from '@/lib/swal';

interface AuthFormProps {
    mode: 'LOGIN' | 'REGISTER';
}

export default function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();

    // Login fields
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // Register fields (additional)
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);
        showLoading(mode === 'LOGIN' ? 'MENGECEK AKUN...' : 'MENDAFTARKAN AKUN...');

        try {
            if (mode === 'LOGIN') {
                // Construct FormData for server action
                const formData = new FormData();
                formData.append('identifier', username);
                formData.append('password', password);

                const result = await signInWithUsername(null, formData);
                
                if (result.error) {
                    throw new Error(result.error);
                }

                closeSwal();
                await showSuccess('Selamat Datang!', 'Berhasil masuk ke sistem SmartMocaf.');
                
                if (result.redirectUrl) {
                    router.push(result.redirectUrl);
                }
            } else {
                // Register: panggil API route
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fullName,
                        username,
                        email,
                        password
                    })
                });

                const result = await res.json();

                if (!res.ok) {
                    let indoError = result.error || 'Gagal mendaftar.';
                    if (indoError.toLowerCase().includes('already exists')) {
                        indoError = 'Username atau Email sudah terdaftar.';
                    }
                    throw new Error(indoError);
                }

                closeSwal();
                await showSuccess('Pendaftaran Berhasil', 'Silakan masuk dengan akun yang baru dibuat.');
                router.push('/auth/login');
            }
        } catch (err: any) {
            closeSwal();
            setErrorMsg(err.message || 'Terjadi kesalahan sistem.');
            showError('Gagal', err.message || 'Silakan periksa kembali data Anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Header Text Only */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {mode === 'LOGIN' ? 'Selamat Datang' : 'Buat Akun Baru'}
                </h1>
                <p className="text-gray-500">
                    {mode === 'LOGIN' ? 'Silakan masuk untuk melanjutkan' : 'Daftar sekarang untuk mulai monitoring'}
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#009e3e]/5 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />
                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        {errorMsg}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {/* Register: Nama Lengkap */}
                    {mode === 'REGISTER' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#009e3e]/20 focus:border-[#009e3e] outline-none transition-all text-gray-900 placeholder-gray-400"
                                placeholder="Masukkan nama lengkap"
                                required
                            />
                        </div>
                    )}
                    
                    {/* Username / Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username atau Email</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#009e3e]/20 focus:border-[#009e3e] outline-none transition-all text-gray-900 placeholder-gray-400"
                            placeholder="Username atau email"
                            required
                        />
                    </div>

                    {/* Register: Email */}
                    {mode === 'REGISTER' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#009e3e]/20 focus:border-[#009e3e] outline-none transition-all text-gray-900 placeholder-gray-400"
                                placeholder="nama@email.com"
                                required
                            />
                        </div>
                    )}
                    
                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#009e3e]/20 focus:border-[#009e3e] outline-none transition-all text-gray-900 placeholder-gray-400"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#009e3e] to-[#00c853] text-white font-bold py-4 rounded-2xl hover:shadow-lg hover:shadow-[#009e3e]/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {loading ? 'Memproses...' : mode === 'LOGIN' ? 'Masuk' : 'Daftar'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    {mode === 'LOGIN' ? (
                        <p className="text-gray-500">
                            Belum punya akun?{' '}
                            <Link href="/auth/register" className="text-[#009e3e] font-semibold hover:underline">
                                Daftar sekarang
                            </Link>
                        </p>
                    ) : (
                        <p className="text-gray-500">
                            Sudah punya akun?{' '}
                            <Link href="/auth/login" className="text-[#009e3e] font-semibold hover:underline">
                                Masuk di sini
                            </Link>
                        </p>
                    )}
                </div>
            </div>

            <div className="text-center mt-8">
                <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}
