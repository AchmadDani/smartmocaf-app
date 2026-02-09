'use client';

import { useState } from 'react';
import { createUser } from '@/app/actions/admin';
import { showSuccess, showError, showLoading, closeSwal } from '@/lib/swal';

interface AddUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddUserDialog({ isOpen, onClose }: AddUserDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        showLoading('Sedang mendaftarkan pengguna...');

        const formData = new FormData(e.currentTarget);
        const result = await createUser(formData);

        setLoading(false);
        closeSwal();

        if (result.error) {
            setError(result.error);
            showError('Gagal Mendaftarkan', result.error);
        } else {
            showSuccess('Berhasil', 'Pengguna baru telah didaftarkan.');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Tambah User Baru</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">Nama Lengkap</label>
                        <input
                            type="text"
                            name="full_name"
                            className="w-full px-4 py-3 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-[#009e3e]/20 focus:border-[#009e3e] focus:bg-white outline-none text-gray-900 font-medium transition-all"
                            placeholder="Contoh: Budi Santoso"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">Username</label>
                            <input
                                type="text"
                                name="username"
                                className="w-full px-4 py-3 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-[#009e3e]/20 focus:border-[#009e3e] focus:bg-white outline-none text-gray-900 font-medium transition-all"
                                placeholder="budi_s"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">Role</label>
                            <div className="relative">
                                <select
                                    name="role"
                                    className="w-full px-4 py-3 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-[#009e3e]/20 focus:border-[#009e3e] focus:bg-white outline-none text-gray-900 font-bold transition-all appearance-none"
                                    required
                                >
                                    <option value="farmer">Farmer</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full px-4 py-3 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-[#009e3e]/20 focus:border-[#009e3e] focus:bg-white outline-none text-gray-900 font-medium transition-all"
                            placeholder="nama@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[10px]">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="w-full px-4 py-3 border border-gray-100 bg-gray-50/50 rounded-xl focus:ring-2 focus:ring-[#009e3e]/20 focus:border-[#009e3e] focus:bg-white outline-none text-gray-900 font-medium transition-all"
                            placeholder="••••••••"
                            minLength={6}
                            required
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-[#009e3e] text-white font-bold rounded-xl hover:bg-[#007d31] disabled:opacity-50 shadow-lg shadow-[#009e3e]/20 transition-all"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
