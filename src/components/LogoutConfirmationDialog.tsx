'use client';

import { signOut } from '../app/actions/auth';
import { showConfirm, showLoading, closeSwal } from '@/lib/swal';

export default function LogoutConfirmationDialog() {
    async function handleLogout() {
        const result = await showConfirm(
            'Keluar dari Aplikasi?',
            'Anda akan keluar dari akun SmartMocaf.',
            'Ya, Keluar'
        );

        if (result.isConfirmed) {
            showLoading('Memproses logout...');
            try {
                await signOut();
            } catch (error) {
                closeSwal();
                console.error('Logout failed:', error);
            }
        }
    }

    return (
        <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors group"
            title="Keluar"
        >
            <span className="font-medium">Keluar</span>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
        </button>
    );
}
