'use client';

import { useState, useTransition } from 'react';
import { createUser } from '@/app/actions/admin';
import { showSuccess, showError, showLoading, closeSwal } from '@/lib/swal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, User, Mail, Shield, Key } from 'lucide-react';

interface AddUserDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddUserDialog({ isOpen, onClose }: AddUserDialogProps) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        showLoading('Sedang mendaftarkan pengguna...');
        startTransition(async () => {
            const result = await createUser(formData);
            closeSwal();

            if (result.error) {
                showError('Gagal Mendaftarkan', result.error);
            } else {
                showSuccess('Berhasil', 'Pengguna baru telah didaftarkan.');
                onClose();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Tambah User Baru
                    </DialogTitle>
                    <DialogDescription>
                        Daftarkan akun baru untuk petani atau admin sistem.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="full_name" className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5" />
                            Nama Lengkap
                        </Label>
                        <Input id="full_name" name="full_name" placeholder="Budi Santoso" required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="username" className="flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5" />
                                Username
                            </Label>
                            <Input id="username" name="username" placeholder="budi_s" required />
                        </div>
                        <div className="grid gap-2">
                            <Label className="flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5" />
                                Role
                            </Label>
                            <Select name="role" defaultValue="farmer">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="farmer">Farmer</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            Email
                        </Label>
                        <Input id="email" name="email" type="email" placeholder="budi@email.com" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="flex items-center gap-2">
                            <Key className="h-3.5 w-3.5" />
                            Password
                        </Label>
                        <Input id="password" name="password" type="password" placeholder="••••••••" minLength={6} required />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Menyimpan...' : 'Simpan User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

