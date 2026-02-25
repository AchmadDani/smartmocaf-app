'use client';

import { useState } from 'react';
import { useTransition } from 'react';
import { adminUpdateDeviceMaxUsers, adminUpdateDeviceOwnerCode } from '@/app/actions/admin';
import { updateDeviceSettings } from '@/app/actions/device';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { showSuccess, showError, showLoading, closeSwal } from '@/lib/swal';
import { useMqtt } from '@/components/MqttProvider';
import { Users, Save, Target, Ruler, KeyRound } from 'lucide-react';

export default function DeviceSettingsForm({ 
    deviceId, 
    deviceCode,
    initialMaxUsers,
    initialOwnerCode,
    currentSettings
}: { 
    deviceId: string; 
    deviceCode: string;
    initialMaxUsers: number;
    initialOwnerCode: string | null;
    currentSettings: any;
}) {
    const [isPending, startTransition] = useTransition();
    const { client } = useMqtt();
    const [ownerCode, setOwnerCode] = useState(initialOwnerCode || '');
    const [ownerCodeEditing, setOwnerCodeEditing] = useState(false);

    const handleMaxUsersSubmit = async (formData: FormData) => {
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

    const handleConfigSubmit = async (formData: FormData) => {
        const targetPh = parseFloat(formData.get('target_ph') as string);
        const maxHeight = parseFloat(formData.get('max_height') as string);

        showLoading('Menyimpan konfigurasi...');
        startTransition(async () => {
            try {
                const payload: any = {};
                if (!isNaN(targetPh)) payload.target_ph = targetPh;
                if (!isNaN(maxHeight)) payload.max_height = maxHeight;

                await updateDeviceSettings(deviceId, payload);
                
                // Also publish to MQTT so firmware gets updated immediately
                if (client && deviceCode) {
                    client.publish(`growify/${deviceCode}/config`, JSON.stringify(payload));
                }
                
                closeSwal();
                showSuccess('Konfigurasi Diperbarui', 'Nilai pH target dan tinggi tangki telah diperbarui.');
            } catch (error) {
                closeSwal();
                showError('Gagal', 'Terjadi kesalahan saat menyimpan konfigurasi.');
            }
        });
    };

    const handleOwnerCodeSubmit = async () => {
        showLoading('Menyimpan kode owner...');
        startTransition(async () => {
            const code = ownerCode.trim() || null;
            const res = await adminUpdateDeviceOwnerCode(deviceId, code);
            closeSwal();
            if (res.success) {
                showSuccess('Kode Owner Diperbarui');
                setOwnerCodeEditing(false);
            } else {
                showError(res.error || 'Gagal memperbarui kode owner');
            }
        });
    };

    return (
        <div className="space-y-4">
            {/* Owner Code */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs font-bold">
                    <KeyRound className="h-3.5 w-3.5" />
                    Kode Owner
                </Label>
                {ownerCodeEditing ? (
                    <div className="flex gap-2">
                        <Input 
                            value={ownerCode}
                            onChange={(e) => setOwnerCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="6 digit"
                            maxLength={6}
                            className="flex-1 font-mono"
                        />
                        <Button type="button" size="icon" onClick={handleOwnerCodeSubmit} disabled={isPending}>
                            <Save className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" onClick={() => { setOwnerCodeEditing(false); setOwnerCode(initialOwnerCode || ''); }}>
                            <KeyRound className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg border">
                        <span className="font-mono text-sm font-bold">
                            {initialOwnerCode || '-'}
                        </span>
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setOwnerCodeEditing(true)}
                            className="text-xs"
                        >
                            Edit
                        </Button>
                    </div>
                )}
                <p className="text-[10px] text-gray-400">
                    6 digit kode opsional untuk keamanan perangkat.
                </p>
            </div>

            <Separator className="my-3" />

            {/* Max Users */}
            <form action={handleMaxUsersSubmit} className="space-y-2">
                <Label htmlFor="max_users" className="flex items-center gap-2 text-xs font-bold">
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
            </form>

            <Separator className="my-3" />

            {/* pH Target & Tank Height */}
            <form action={handleConfigSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="target_ph" className="flex items-center gap-2 text-xs font-bold">
                            <Target className="h-3.5 w-3.5" />
                            Target pH
                        </Label>
                        <Input 
                            id="target_ph"
                            name="target_ph"
                            type="number"
                            step="0.01"
                            min="0"
                            max="14"
                            defaultValue={currentSettings?.targetPh ?? 4.5}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="max_height" className="flex items-center gap-2 text-xs font-bold">
                            <Ruler className="h-3.5 w-3.5" />
                            Tinggi Tangki (cm)
                        </Label>
                        <Input 
                            id="max_height"
                            name="max_height"
                            type="number"
                            step="1"
                            min="1"
                            defaultValue={currentSettings?.maxHeight ?? 50}
                            required
                        />
                    </div>
                </div>
                <Button type="submit" className="w-full h-9 text-xs font-bold" disabled={isPending}>
                    <Save className="h-3.5 w-3.5 mr-2" />
                    Simpan Konfigurasi Perangkat
                </Button>
                <p className="text-[10px] text-gray-400">
                    Akan disimpan ke database dan dikirim ke perangkat via MQTT.
                </p>
            </form>
        </div>
    );
}
