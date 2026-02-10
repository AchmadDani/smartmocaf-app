'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import { 
    LayoutDashboard, 
    Cpu, 
    Users, 
    LogOut, 
    ChevronLeft, 
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminSidebarProps {
    isOpen: boolean;
    isCollapsed: boolean;
    onClose: () => void;
    onToggleCollapse: () => void;
}

export default function AdminSidebar({ isOpen, isCollapsed, onClose, onToggleCollapse }: AdminSidebarProps) {
    const pathname = usePathname();

    const navItems = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: LayoutDashboard
        },
        {
            name: 'Perangkat',
            href: '/admin/devices',
            icon: Cpu
        },
        {
            name: 'Pengguna',
            href: '/admin/users',
            icon: Users
        }
    ];

    return (
        <>
            {/* Overlay (mobile) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" 
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed left-0 top-0 h-screen bg-white border-r border-gray-100 z-50
                flex flex-col transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${isCollapsed ? 'lg:w-[80px]' : 'lg:w-64'}
                w-72
            `}>
                {/* Logo Section */}
                <div className={`p-6 border-b border-gray-50 h-[88px] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <Link href="/admin" className="flex items-center gap-2 group overflow-hidden" onClick={onClose}>
                        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20">
                            S
                        </div>
                        {!isCollapsed && (
                            <span className="font-black text-xl tracking-tighter text-gray-900 group-hover:text-primary transition-colors whitespace-nowrap">
                                Smart<span className="text-primary">Mocaf</span>
                            </span>
                        )}
                    </Link>
                </div>

                {/* Collapse Toggle (Desktop only) */}
                <button 
                    onClick={onToggleCollapse}
                    className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-100 rounded-full hidden lg:flex items-center justify-center text-gray-400 hover:text-primary shadow-sm hover:shadow transition-all z-10"
                >
                    {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
                </button>

                {/* Navigation */}
                <nav className="p-3 space-y-1.5 flex-1 mt-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || 
                            (item.href !== '/admin' && pathname.startsWith(item.href));
                        
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                title={isCollapsed ? item.name : ''}
                                className={`flex items-center gap-3 rounded-xl transition-all h-11 ${
                                    isCollapsed ? 'justify-center px-0' : 'px-4'
                                } ${
                                    isActive 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? '' : 'text-gray-400'}`} />
                                {!isCollapsed && <span className="font-bold text-sm tracking-tight">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Profile/Logout */}
                <div className="p-3 border-t border-gray-100">
                    <LogoutButton className={`flex items-center gap-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-xs h-11 ${
                        isCollapsed ? 'justify-center px-0' : 'px-4'
                    }`}>
                        <LogOut className="h-4 w-4" />
                        {!isCollapsed && <span>Keluar</span>}
                    </LogoutButton>
                </div>
            </aside>
        </>
    );
}

