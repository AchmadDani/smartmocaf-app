'use client';

import { useState } from 'react';
import { signOut } from '../app/actions/auth';

export default function LogoutButton() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogout() {
        setIsLoading(true);
        try {
            await signOut();
        } catch (error) {
            console.error('Logout failed:', error);
            setIsLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="p-1 text-black hover:bg-gray-100 rounded-full transition-colors"
                title="Keluar"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
            </button>

            {showConfirm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm relative shadow-lg">
                        <h3 className="text-lg font-medium text-center text-gray-900 mb-6">
                            Apakah anda ingin logout?
                        </h3>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={isLoading}
                                className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Tidak
                            </button>
                            <button
                                onClick={handleLogout}
                                disabled={isLoading}
                                className="px-6 py-2 bg-[#C08080] text-white font-medium rounded-lg hover:bg-[#A06060] transition-colors"
                            >
                                {isLoading ? '...' : 'Ya'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
