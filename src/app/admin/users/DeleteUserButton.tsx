'use client';

import { useTransition } from 'react';
import { deleteUser } from '@/app/actions/admin';
import { showDeleteConfirm, showSuccess, showError, showLoading, closeSwal } from '@/lib/swal';

interface DeleteUserButtonProps {
    userId: string;
    userName: string;
}

export default function DeleteUserButton({ userId, userName }: DeleteUserButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        const result = await showDeleteConfirm(
            'Hapus Pengguna?',
            `Akun "${userName}" akan dihapus permanen dari sistem SmartMocaf.`
        );

        if (result.isConfirmed) {
            startTransition(async () => {
                showLoading('Menghapus pengguna...');
                try {
                    const res = await deleteUser(userId);
                    closeSwal();
                    if (res?.error) {
                        showError('Gagal Menghapus', res.error);
                    } else {
                        showSuccess('User Dihapus', 'Akun telah dihapus dari sistem.');
                    }
                } catch (error) {
                    closeSwal();
                    showError('Gagal Menghapus', 'Terjadi kesalahan tidak terduga.');
                }
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50 disabled:opacity-50"
            title="Hapus User"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/>
            </svg>
        </button>
    );
}
