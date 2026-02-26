'use client';

import { Menu, Bell, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LogoutButton from '@/components/LogoutButton';
import Image from 'next/image';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';
import { showLogoutConfirm, showLoading } from '@/lib/swal';

interface AdminHeaderProps {
    user: {
        full_name?: string | null;
        email?: string;
    };
    onMenuToggle: () => void;
}

export default function AdminHeader({ user, onMenuToggle }: AdminHeaderProps) {
    const router = useRouter();
    const displayName = user.full_name || user.email?.split('@')[0] || 'Admin';
    const initial = displayName[0]?.toUpperCase() || 'A';

    const handleLogout = async () => {
        const result = await showLogoutConfirm();
        if (result.isConfirmed) {
            showLoading('Keluar...');
            try {
                const res = await fetch('/api/auth/logout', { method: 'POST' });
                if (res.ok) {
                    window.location.href = '/auth/login?message=logout_success';
                }
            } catch {
                window.location.href = '/auth/login';
            }
        }
    };

    return (
        <header className="bg-white/80 backdrop-blur-md px-4 sm:px-6 md:px-10 h-14 md:h-16 border-b border-gray-100/80 flex justify-between items-center sticky top-0 z-40 w-full shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-4 md:gap-6">
                {/* Hamburger — mobile only */}
                <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={onMenuToggle}
                    className="lg:hidden rounded-xl md:rounded-2xl h-10 w-10 md:h-11 md:w-11 hover:bg-primary/5 text-gray-400 group border border-gray-100 shadow-sm"
                    aria-label="Toggle menu"
                >
                    <Menu className="h-5 w-5 group-hover:text-primary transition-colors" />
                </Button>

                {/* Logo */}
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="relative w-12 h-12 md:w-14 md:h-14">
                        <Image 
                            src="/assets/images/logos/Logo Growify Tech + Smart Mocaf.png" 
                            alt="SmartMocaf" 
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="hidden lg:block">
                        <p className="text-[10px] uppercase font-black tracking-[0.25em] text-gray-300 mb-0.5">Control Center</p>
                        <h1 className="text-lg md:text-xl font-black tracking-tight text-gray-900 leading-none">
                            Manajemen <span className="text-primary underline decoration-primary/20 decoration-4 underline-offset-4">Sistem</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-8">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Live Server</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 md:h-11 md:w-11 rounded-xl md:rounded-2xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all relative border border-transparent hover:border-primary/10">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                    </Button>
                </div>

                <div className="h-6 md:h-8 w-px bg-gray-100 hidden sm:block" />

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 md:gap-4 group cursor-pointer outline-none">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-gray-900 tracking-tight group-hover:text-primary transition-colors">{displayName}</p>
                                <p className="text-[10px] uppercase font-black tracking-widest text-gray-300">Administrator</p>
                            </div>
                            <div className="w-10 md:w-12 h-10 md:h-12 rounded-[1.1rem] bg-gray-50 flex items-center justify-center font-black text-sm text-gray-400 border border-gray-100 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300">
                                {initial}
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border border-gray-100 shadow-xl shadow-gray-200/50">
                        <DropdownMenuLabel className="px-3 py-2">
                            <p className="text-sm font-black text-gray-900">{displayName}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{user.email || 'admin'}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="px-3 py-2.5 rounded-xl cursor-pointer text-red-500 focus:text-red-600 focus:bg-red-50 gap-3 font-bold"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            Keluar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
