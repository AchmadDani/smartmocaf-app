'use client';

import { useTransition } from 'react';
import { adminUpdateDeviceMaxUsers } from '@/app/actions/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showSuccess, showError, showLoading, closeSwal } from '@/lib/swal';
import { Users, Save } from 'lucide-react';

export default function DeviceSettingsForm({ 
    deviceId, 
    initialMaxUsers,
    currentSettings
}: { 
    deviceId: string; 
    initialMaxUsers: number;
    currentSettings: any;
}) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (formData: FormData) => {
        const maxUsers = Number(formData.get('max_users'));
        
        showLoading('Menyimpan perubahan...');
        startTransition(async () => {
            const res = await adminUpdateDeviceMaxUsers(deviceId, maxUsers);
            closeSwal();
            if (res.success) {
                showSuccess('Limit pengguna diperbarui');
            } else {
                showError(res.error || 'Gagal memperbarui limit');
            }
        });
    };

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="max_users" className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Batas Maksimum Pengguna
                </Label>
                <div className="flex gap-2">
                    <Input 
                        id="max_users"
                        name="max_users"
                        type="number"
                        min="1"
                        defaultValue={initialMaxUsers}
                        className="flex-1"
                        required
                    />
                    <Button type="submit" size="icon" disabled={isPending}>
                        <Save className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-[10px] text-gray-400">
                    Berapa banyak petani yang bisa klaim alat ini secara bersamaan.
                </p>
            </div>
        </form>
    );
}
