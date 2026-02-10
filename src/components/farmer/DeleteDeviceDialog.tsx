'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteDevice } from '@/app/actions/device';
import { showDeleteConfirm, showSuccess, showError, showLoading, closeSwal } from '@/lib/swal';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isPending}
            className="h-10 w-10 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all group"
            aria-label="Delete device"
        >
            <Trash2 className="h-5 w-5 transition-transform group-hover:scale-110" />
        </Button>
    );
}

