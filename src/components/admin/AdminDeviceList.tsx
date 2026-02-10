'use client';

import { useTransition, useState } from 'react';
import { adminCreateDevice, adminDeleteDevice } from '@/app/actions/admin';
import { showConfirm, showSuccess, showError, showLoading, closeSwal } from '@/lib/swal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    Plus, 
    Search, 
    Trash2, 
    ExternalLink, 
    Users,
    MoreHorizontal,
    ChevronRight,
    MonitorSmartphone,
    Cpu,
    Fingerprint,
    CalendarDays,
    ArrowUpRight
} from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link';

interface Device {
    id: string;
    name: string;
    deviceCode: string;
    isOnline: boolean;
    lastSeen: string | null;
    ownerName: string | null;
    userCount: number;
    createdAt: string;
}

export default function AdminDeviceList({ initialDevices }: { initialDevices: Device[] }) {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleAdd = (formData: FormData) => {
        const name = formData.get('name') as string;
        const deviceCode = formData.get('device_code') as string;

        startTransition(async () => {
            showLoading('Mendaftarkan perangkat...');
            const result = await adminCreateDevice(name, deviceCode);
            closeSwal();

            if (result.error) {
                showError('Gagal', result.error);
            } else {
                showSuccess('Berhasil!', 'Perangkat berhasil didaftarkan.');
                setOpen(false);
            }
        });
    };

    const handleDelete = async (id: string, name: string) => {
        const result = await showConfirm(
            'Hapus Perangkat?',
            `Perangkat "${name}" akan dihapus secara permanen dari sistem.`,
            'Ya, Hapus'
        );

        if (result) {
            startTransition(async () => {
                showLoading('Menghapus...');
                const res = await adminDeleteDevice(id);
                closeSwal();
                if (res.error) {
                    showError('Gagal', res.error);
                } else {
                    showSuccess('Dihapus!', 'Perangkat berhasil dihapus.');
                }
            });
        }
    };

    const filteredDevices = initialDevices.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.deviceCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-md group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="Cari kode hardware atau nama unit..." 
                        className="pl-10 h-12 rounded-2xl border-gray-100 bg-white shadow-sm focus:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto h-12 px-6 rounded-2xl gap-2 font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                            <Plus className="h-4 w-4" />
                            Tambah Perangkat
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-gray-100 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black tracking-tight">Daftarkan Perangkat Baru</DialogTitle>
                            <DialogDescription className="text-sm font-bold text-gray-400">
                                Input kode unik hardware untuk mendaftarkannya ke sistem.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={handleAdd} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="device_code" className="text-xs font-black uppercase tracking-widest text-gray-400">Kode Hardware</Label>
                                <Input id="device_code" name="device_code" placeholder="SMCF-XXXX-XXXX" required className="h-12 rounded-xl font-mono" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-gray-400">Nama Perangkat</Label>
                                <Input id="name" name="name" placeholder="Masukan nama unit (Contoh: Fermenter-01)" required className="h-12 rounded-xl" />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="submit" disabled={isPending} className="w-full h-12 rounded-xl font-black uppercase text-xs tracking-widest">
                                    {isPending ? 'Mendaftarkan...' : 'Konfirmasi Pendaftaran'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            {filteredDevices.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-24 text-center shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200">
                        <MonitorSmartphone className="h-10 w-10 text-gray-200" />
                    </div>
                    <h3 className="text-gray-900 font-black tracking-tight text-xl">Unit Tidak Ditemukan</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Coba gunakan kata kunci pencarian yang berbeda</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredDevices.map((device) => (
                        <div key={device.id} className="group relative bg-white rounded-3xl border border-gray-100 p-5 hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-gray-200/40">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-5 min-w-0">
                                    <div className="relative">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all shadow-sm ${
                                            device.isOnline ? 'bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            <Cpu className="h-7 w-7" />
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${device.isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                    </div>
                                    
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-black text-gray-900 tracking-tight group-hover:text-primary transition-colors truncate">{device.name}</h3>
                                            <Badge variant="outline" className={`text-[9px] font-black uppercase px-2 py-0 h-5 border-0 ${device.isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {device.isOnline ? "ACTIVE" : "OFFLINE"}
                                            </Badge>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 mt-1.5">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                <Fingerprint className="h-3 w-3 text-gray-300" />
                                                <span className="font-mono">{device.deviceCode}</span>
                                            </div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-100 hidden sm:block" />
                                            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                <Users className="h-3.5 w-3.5 text-gray-300" />
                                                {device.userCount} <span className="text-[10px] uppercase font-black tracking-tighter">Terhubung</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="hidden lg:flex flex-col items-end mr-6 text-right">
                                        <span className={`text-[11px] font-black tracking-tight ${device.ownerName ? 'text-gray-900' : 'text-orange-500 underline decoration-dashed'}`}>
                                            {device.ownerName || "BELUM DIKLAIM"}
                                        </span>
                                        <div className="flex items-center gap-1 text-[9px] font-black text-gray-300 uppercase tracking-widest mt-0.5">
                                            <CalendarDays className="h-2 w-2" />
                                            PROPRIETARY OWNER
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-gray-100">
                                                <DropdownMenuLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 py-2">Device Management</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-gray-50" />
                                                <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 font-bold text-xs gap-3 cursor-pointer">
                                                    <Link href={`/admin/devices/${device.id}`}>
                                                        <ExternalLink className="h-4 w-4 text-blue-500" />
                                                        Manage Dimensions
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-gray-50" />
                                                <DropdownMenuItem 
                                                    className="rounded-xl px-3 py-2.5 font-bold text-xs gap-3 text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                                    onClick={() => handleDelete(device.id, device.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Terminate Unit
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-primary/10 hover:text-primary transition-all border border-gray-100">
                                            <Link href={`/admin/devices/${device.id}`}>
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


