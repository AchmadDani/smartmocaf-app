'use client';

import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LogoutButton from '@/components/LogoutButton';

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
        <header className="bg-white/80 backdrop-blur-md px-6 sm:px-10 h-[88px] border-b border-gray-100/80 flex justify-between items-center sticky top-0 z-40 w-full shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-6">
                {/* Hamburger — mobile only */}
                <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={onMenuToggle}
                    className="lg:hidden rounded-2xl h-11 w-11 hover:bg-primary/5 text-gray-400 group border border-gray-100 shadow-sm"
                    aria-label="Toggle menu"
                >
                    <Menu className="h-5 w-5 group-hover:text-primary transition-colors" />
                </Button>

                <div className="hidden lg:block">
                    <p className="text-[10px] uppercase font-black tracking-[0.25em] text-gray-300 mb-0.5">Control Center</p>
                    <h1 className="text-xl font-black tracking-tight text-gray-900 leading-none">
                        Manajemen <span className="text-primary underline decoration-primary/20 decoration-4 underline-offset-4">Sistem</span>
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-8">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">Live Server</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-gray-400 hover:text-primary hover:bg-primary/5 transition-all relative border border-transparent hover:border-primary/10">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                    </Button>
                    <LogoutButton />
                </div>

                <div className="h-8 w-px bg-gray-100 hidden sm:block" />

                <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-gray-900 tracking-tight group-hover:text-primary transition-colors">{displayName}</p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-gray-300">Administrator</p>
                    </div>
                    <div className="w-12 h-12 rounded-[1.1rem] bg-gray-50 flex items-center justify-center font-black text-sm text-gray-400 border border-gray-100 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-300">
                        {initial}
                    </div>
                </div>
            </div>
        </header>
    );
}



