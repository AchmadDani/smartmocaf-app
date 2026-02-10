'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
    user: {
        full_name?: string | null;
        email?: string;
    };
    onMenuToggle: () => void;
}

export default function AdminHeader({ user, onMenuToggle }: AdminHeaderProps) {
    const displayName = user.full_name || user.email?.split('@')[0] || 'Admin';
    const initial = displayName[0]?.toUpperCase() || 'A';

    return (
        <header className="bg-white px-4 sm:px-8 h-[88px] border-b border-gray-100 flex justify-between items-center sticky top-0 z-30 w-full backdrop-blur-md bg-white/80">
            <div className="flex items-center gap-4">
                {/* Hamburger — mobile only */}
                <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={onMenuToggle}
                    className="lg:hidden rounded-xl h-11 w-11 hover:bg-gray-50 text-gray-400 group"
                    aria-label="Toggle menu"
                >
                    <Menu className="h-6 w-6 group-hover:text-primary transition-colors" />
                </Button>

                <div className="hidden lg:block">
                    <h1 className="text-xl font-black tracking-tight text-gray-900">
                        Manajemen <span className="text-primary">Sistem</span>
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </Button>

                <div className="h-8 w-px bg-gray-100 hidden sm:block" />

                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-gray-900 tracking-tight group-hover:text-primary transition-colors">{displayName}</p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-300">Administrator</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-sm text-gray-400 border border-gray-100 shadow-sm group-hover:shadow-md group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                        {initial}
                    </div>
                </div>
            </div>
        </header>
    );
}

