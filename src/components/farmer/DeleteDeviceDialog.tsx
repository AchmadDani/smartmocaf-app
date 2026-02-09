'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteDevice } from '@/app/actions/device';
import { showDeleteConfirm, showSuccess, showError, showLoading, closeSwal } from '@/lib/swal';

interface DeleteDeviceDialogProps {
    deviceId: string;
    deviceName: string;
}

export default function DeleteDeviceDialog({ deviceId, deviceName }: DeleteDeviceDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        const result = await showDeleteConfirm(
            'Hapus Perangkat?',
            `Perangkat "${deviceName}" akan dihapus beserta semua data telemetri dan riwayat fermentasi.`
        );

        if (result.isConfirmed) {
            startTransition(async () => {
                showLoading('Menghapus perangkat...');
                try {
                    await deleteDevice(deviceId);
                    closeSwal();
                    await showSuccess('Perangkat Dihapus', 'Data telah dihapus dari sistem.');
                    router.push('/farmer');
                } catch (error) {
                    closeSwal();
                    showError('Gagal Menghapus', 'Terjadi kesalahan saat menghapus perangkat.');
                }
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
            aria-label="Delete device"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
        </button>
    );
}
