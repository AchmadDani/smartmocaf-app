'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import { 
    LayoutDashboard, 
    Cpu, 
    Users, 
    LogOut, 
    ChevronLeft, 
    ChevronRight,
} from 'lucide-react';

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
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden transition-all duration-300" 
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed left-0 top-0 h-screen bg-white border-r border-gray-100/80 z-50
                flex flex-col transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${isCollapsed ? 'lg:w-[88px]' : 'lg:w-[280px]'}
                w-72 shadow-[0_0_40px_rgba(0,0,0,0.02)]
            `}>
                {/* Logo Section */}
                <div className={`p-6 h-[88px] flex items-center border-b border-gray-50/50 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <Link href="/admin" className="flex items-center gap-3 group overflow-hidden" onClick={onClose}>
                        <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-[0.9rem] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                            S
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className="font-black text-lg tracking-tight text-gray-900 leading-none">
                                    Smart<span className="text-primary">Mocaf</span>
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 mt-1">Management</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Collapse Toggle (Desktop only) - Gacor Edition */}
                <button 
                    onClick={onToggleCollapse}
                    className={`
                        absolute -right-4 top-[100px] w-8 h-8 bg-white border border-gray-100 rounded-xl
                        hidden lg:flex items-center justify-center text-gray-400 hover:text-primary 
                        shadow-lg shadow-gray-200/50 hover:shadow-primary/20 hover:scale-110
                        hover:border-primary/20 transition-all duration-300 z-50 group/toggle
                    `}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <div className="transition-transform duration-500 ease-in-out">
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 group-hover/toggle:translate-x-0.5" />
                        ) : (
                            <ChevronLeft className="h-4 w-4 group-hover/toggle:-translate-x-0.5" />
                        )}
                    </div>
                </button>

                {/* Navigation */}
                <nav className="p-4 space-y-2 flex-1 mt-4 overflow-y-auto no-scrollbar">
                    {!isCollapsed && (
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-300 px-4 mb-4">Main Menu</p>
                    )}
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || 
                            (item.href !== '/admin' && pathname.startsWith(item.href));
                        
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                title={isCollapsed ? item.name : ''}
                                className={`
                                    relative flex items-center gap-4 rounded-2xl transition-all duration-300 h-12 group/nav
                                    ${isCollapsed ? 'justify-center px-0' : 'px-4'}
                                    ${isActive 
                                        ? 'bg-primary text-white shadow-xl shadow-primary/25 translate-x-1' 
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }
                                `}
                            >
                                <div className={`relative ${isActive ? 'scale-110' : 'group-hover/nav:scale-110'} transition-transform duration-300`}>
                                    <item.icon className="h-5 w-5" />
                                    {isActive && isCollapsed && (
                                        <div className="absolute -right-1 -top-1 w-2 h-2 bg-white rounded-full border-2 border-primary" />
                                    )}
                                </div>
                                {!isCollapsed && (
                                    <span className="font-black text-[13px] tracking-tight">{item.name}</span>
                                )}
                                {isActive && !isCollapsed && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-40 shadow-sm" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout Section */}
                <div className={`p-4 border-t border-gray-50/50 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <LogoutButton 
                        className={`
                            w-full flex items-center gap-4 rounded-2xl transition-all duration-300 h-12 group/logout
                            text-gray-400 hover:bg-red-50 hover:text-red-500
                            ${isCollapsed ? 'justify-center px-0' : 'px-4'}
                        `}
                    >
                        {!isCollapsed && 'Keluar'}
                    </LogoutButton>
                </div>
            </aside>
        </>
    );
}


