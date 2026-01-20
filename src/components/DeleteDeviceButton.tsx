'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteDevice } from '@/app/actions/device';

export default function DeleteDeviceButton({ deviceId }: { deviceId: string }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteDevice(deviceId);
            // Redirect happens via server action or router logic? 
            // Server action revalidates path, client needs to navigate.
            router.push('/devices');
        } catch (error) {
            alert('Gagal menghapus alat. Silakan coba lagi.');
            console.error(error);
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                title="Hapus Alat"
            >
                {/* Trash Icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>

            {showConfirm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm relative shadow-lg">
                        <h3 className="text-lg font-medium text-center text-gray-900 mb-2">
                            Hapus Alat?
                        </h3>
                        <p className="text-center text-gray-500 mb-6 text-sm">
                            Tindakan ini tidak dapat dibatalkan. Semua data riwayat fermentasi alat ini akan hilang.
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
                            >
                                {isDeleting ? 'Menghapus...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
