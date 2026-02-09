'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDevice } from '@/app/actions/device';
import { showSuccess, showError } from '@/lib/swal';

interface AddDeviceDialogProps {
    variant?: 'button' | 'link';
}

export default function AddDeviceDialog({ variant = 'button' }: AddDeviceDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [deviceName, setDeviceName] = useState('');
    const [deviceCode, setDeviceCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await createDevice(deviceName, deviceCode);
            setIsOpen(false);
            setDeviceName('');
            setDeviceCode('');
            showSuccess('Alat Ditambahkan', `${deviceName} berhasil ditambahkan ke sistem.`);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Gagal menambahkan alat');
            showError('Gagal Menambahkan', err.message || 'Terjadi kesalahan saat menambahkan alat.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {variant === 'button' ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-[#009e3e] text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[#007d31] transition-colors flex items-center gap-2 shadow-lg shadow-[#009e3e]/20"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Tambah Alat
                </button>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-[#009e3e] font-medium hover:underline text-sm"
                >
                    + Tambah Alat Baru
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in-up">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>

                        {/* Header */}
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-[#009e3e]/10 rounded-2xl flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#009e3e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                    <line x1="8" y1="21" x2="16" y2="21"/>
                                    <line x1="12" y1="17" x2="12" y2="21"/>
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Tambah Alat Baru</h2>
                            <p className="text-sm text-gray-500 mt-1">Masukkan kode device dari alat fermenter Anda</p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Alat
                                </label>
                                <input
                                    type="text"
                                    value={deviceName}
                                    onChange={(e) => setDeviceName(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#009e3e]/20 focus:border-[#009e3e] outline-none text-gray-900 transition-all"
                                    placeholder="Fermenter #1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kode Device
                                </label>
                                <input
                                    type="text"
                                    value={deviceCode}
                                    onChange={(e) => setDeviceCode(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#009e3e]/20 focus:border-[#009e3e] outline-none text-gray-900 transition-all font-mono tracking-wider"
                                    placeholder="0001"
                                    maxLength={10}
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    Kode device tertera pada alat IoT Anda (contoh: 0001)
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-[#009e3e] text-white rounded-xl font-medium hover:bg-[#007d31] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#009e3e]/20"
                                >
                                    {loading ? 'Menambahkan...' : 'Tambah Alat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
