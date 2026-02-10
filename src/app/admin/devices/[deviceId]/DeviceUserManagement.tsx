'use client';

import { useState, useTransition } from 'react';
import { adminRemoveDeviceUser, adminAddDeviceUser } from '@/app/actions/admin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    Trash2, 
    UserPlus, 
    ShieldCheck, 
    Eye,
    Plus,
    X,
    Users
} from 'lucide-react';
import { showConfirm, showSuccess, showError, showLoading, closeSwal } from '@/lib/swal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';

interface DeviceUser {
    userId: string;
    role: 'owner' | 'viewer';
    joinedAt: Date;
    user: {
        id: string;
        fullName: string;
        username: string;
        email: string;
    };
}

export default function DeviceUserManagement({ 
    deviceId, 
    deviceUsers,
    availableUsers
}: { 
    deviceId: string; 
    deviceUsers: DeviceUser[];
    availableUsers: { id: string; fullName: string; username: string }[];
}) {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRole, setSelectedRole] = useState<'owner' | 'viewer'>('viewer');

    const handleRemove = async (userId: string, name: string) => {
        const confirmed = await showConfirm(
            `Lepaskan Pengguna?`,
            `${name} tidak akan lagi memiliki akses ke alat ini.`
        );

        if (confirmed) {
            showLoading('Melepas pengguna...');
            startTransition(async () => {
                const res = await adminRemoveDeviceUser(deviceId, userId);
                closeSwal();
                if (res.success) {
                    showSuccess('Pengguna dilepas');
                } else {
                    showError(res.error || 'Gagal melepas pengguna');
                }
            });
        }
    };

    const handleAdd = async () => {
        if (!selectedUserId) return;
        
        setOpen(false);
        showLoading('Menambahkan pengguna...');
        startTransition(async () => {
            const res = await adminAddDeviceUser(deviceId, selectedUserId, selectedRole);
            closeSwal();
            if (res.success) {
                showSuccess('Pengguna ditambahkan');
                setSelectedUserId('');
            } else {
                showError(res.error || 'Gagal menambahkan pengguna');
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <UserPlus className="h-4 w-4" />
                            Tambah Pengguna
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hubungkan Pengguna</DialogTitle>
                            <DialogDescription>
                                Berikan akses ke perangkat ini untuk pengguna lain.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Pilih Pengguna</Label>
                                <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Cari nama pengguna..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableUsers.map(user => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.fullName} (@{user.username})
                                            </SelectItem>
                                        ))}
                                        {availableUsers.length === 0 && (
                                            <div className="p-2 text-center text-xs text-gray-400">
                                                Tidak ada pengguna baru ditemukan
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Hak Akses (Role)</Label>
                                <Select onValueChange={(v) => setSelectedRole(v as any)} defaultValue="viewer">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="owner">Owner (Kontrol Penuh)</SelectItem>
                                        <SelectItem value="viewer">Viewer (Hanya Lihat)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                            <Button onClick={handleAdd} disabled={!selectedUserId || isPending}>
                                Tambahkan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Terhubung</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deviceUsers.map((item) => (
                            <TableRow key={item.userId}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8 hover:scale-105 transition-transform">
                                            <AvatarFallback className={item.role === 'owner' ? 'bg-[#009e3e]/10 text-[#009e3e]' : 'bg-blue-50 text-blue-600'}>
                                                {item.user.fullName?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm leading-none">{item.user.fullName}</span>
                                            <span className="text-[10px] text-gray-400 mt-1">@{item.user.username}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={item.role === 'owner' ? 'success' : 'info'} className="gap-1">
                                        {item.role === 'owner' ? (
                                            <ShieldCheck className="h-3 w-3" />
                                        ) : (
                                            <Eye className="h-3 w-3" />
                                        )}
                                        {item.role.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs text-gray-500">
                                        {new Date(item.joinedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant="ghost" 
                                        size="icon-sm" 
                                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                                        onClick={() => handleRemove(item.userId, item.user.fullName)}
                                        disabled={isPending}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {deviceUsers.length === 0 && (
                    <div className="p-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 mt-2">
                        <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Belum ada pengguna terhubung</p>
                    </div>
                )}
            </div>
        </div>
    );
}
