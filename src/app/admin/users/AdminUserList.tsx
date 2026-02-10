'use client';

import { useTransition, useState } from 'react';
import { toggleUserActive, deleteUser } from '@/app/actions/admin';
import { showConfirm, showSuccess, showError, showLoading, closeSwal } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    Trash2, 
    MoreHorizontal, 
    UserX, 
    UserCheck, 
    ShieldCheck,
    User,
    CalendarDays,
    Settings2,
    Mail,
    Fingerprint
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from '@/components/ui/switch';

interface UserProfile {
    id: string;
    fullName: string;
    username: string;
    email: string;
    role: 'admin' | 'farmer';
    isActive: boolean;
    createdAt: string;
}

export default function AdminUserList({ profiles }: { profiles: UserProfile[] }) {
    const [isPending, startTransition] = useTransition();

    const handleToggleActive = async (userId: string, name: string, currentStatus: boolean) => {
        const actionText = currentStatus ? 'Nonaktifkan' : 'Aktifkan';
        const confirmed = await showConfirm(
            `${actionText} User?`,
            `User ${name} ${currentStatus ? 'tidak akan bisa login' : 'akan bisa login kembali'}.`
        );

        if (confirmed) {
            showLoading('Memperbarui status...');
            startTransition(async () => {
                const res = await toggleUserActive(userId, !currentStatus);
                closeSwal();
                if (res.success) {
                    showSuccess(`User ${currentStatus ? 'dinonaktifkan' : 'diaktifkan'}`);
                } else {
                    showError(res.error || 'Gagal memperbarui status');
                }
            });
        }
    };

    const handleDelete = async (userId: string, name: string) => {
        const confirmed = await showConfirm(
            'Hapus User?',
            `Akun ${name} akan dihapus permanen. Aksi ini tidak bisa dibatalkan.`,
            'Ya, Hapus'
        );

        if (confirmed) {
            showLoading('Menghapus user...');
            startTransition(async () => {
                const res = await deleteUser(userId);
                closeSwal();
                if (res.success) {
                    showSuccess('User berhasil dihapus');
                } else {
                    showError(res.error || 'Gagal menghapus user');
                }
            });
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="hover:bg-transparent border-gray-50">
                            <TableHead className="py-5 px-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Pengguna</TableHead>
                            <TableHead className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Akses Role</TableHead>
                            <TableHead className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Status Akun</TableHead>
                            <TableHead className="hidden md:table-cell text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Terdaftar</TableHead>
                            <TableHead className="text-right py-5 px-6 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Opsi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {profiles.map((user) => (
                            <TableRow key={user.id} className="group border-gray-50 transition-colors hover:bg-gray-50/40">
                                <TableCell className="py-4 px-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-11 w-11 ring-2 ring-white shadow-md">
                                                <AvatarFallback className={`font-black text-sm ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {user.fullName?.[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${user.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-black text-sm text-gray-900 leading-tight truncate">{user.fullName}</span>
                                            <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 mt-0.5">
                                                <Fingerprint className="h-2.5 w-2.5" />
                                                <span className="truncate">{user.username}</span>
                                                <span className="mx-1 opacity-20">•</span>
                                                <Mail className="h-2.5 w-2.5" />
                                                <span className="truncate">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'secondary' : 'info'} className="gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider h-7">
                                        {user.role === 'admin' ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Switch 
                                            checked={user.isActive} 
                                            onCheckedChange={() => handleToggleActive(user.id, user.fullName, user.isActive)}
                                            disabled={isPending}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                        <Badge variant="outline" className={`text-[9px] font-black uppercase px-2 py-0 h-5 border-0 bg-transparent ${user.isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                                            {user.isActive ? 'ONLINE' : 'OFFLINE'}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                        <CalendarDays className="h-3.5 w-3.5 text-gray-300" />
                                        {new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right py-4 px-6">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl shadow-xl border-gray-100">
                                            <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 py-2">Account Control</DropdownMenuLabel>
                                            <DropdownMenuSeparator className="bg-gray-50" />
                                            <DropdownMenuItem 
                                                onClick={() => handleToggleActive(user.id, user.fullName, user.isActive)}
                                                className="rounded-xl px-3 py-2.5 font-bold text-xs gap-3 cursor-pointer"
                                            >
                                                {user.isActive ? (
                                                    <><UserX className="h-4 w-4 text-orange-500" /> Disable Account</>
                                                ) : (
                                                    <><UserCheck className="h-4 w-4 text-emerald-500" /> Enable Account</>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-gray-50" />
                                            <DropdownMenuItem 
                                                className="rounded-xl px-3 py-2.5 font-bold text-xs gap-3 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                                onClick={() => handleDelete(user.id, user.fullName)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Permanently Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {profiles.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                            <UserX className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-gray-900 font-black tracking-tight">Data Tidak Ditemukan</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Sesuaikan filter atau tambah pengguna baru</p>
                    </div>
                )}
            </div>
        </div>
    );
}

