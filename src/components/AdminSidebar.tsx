'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import LogoutConfirmationDialog from './LogoutConfirmationDialog';

export default function AdminSidebar() {
    const pathname = usePathname();

    const navItems = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="3" width="7" height="9" rx="1"/>
                    <rect x="14" y="3" width="7" height="5" rx="1"/>
                    <rect x="14" y="12" width="7" height="9" rx="1"/>
                    <rect x="3" y="16" width="7" height="5" rx="1"/>
                </svg>
            )
        },
        {
            name: 'Pengguna',
            href: '/admin/users',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
            )
        }
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 z-40 lg:flex flex-col hidden">
            {/* Logo */}
            <div className="p-8 border-b border-gray-50">
                <Link href="/admin" className="flex flex-col gap-2 group">
                    <Image 
                        src="/assets/images/logos/Logo Growify Tech + Smart Mocaf.png" 
                        alt="SmartMocaf" 
                        width={180} 
                        height={40}
                        className="h-auto group-hover:scale-105 transition-transform duration-500"
                        priority
                    />
                    <div className="flex items-center gap-2">
                        <span className="h-px bg-gray-100 flex-1"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">Admin</span>
                        <span className="h-px bg-gray-100 flex-1"></span>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || 
                        (item.href !== '/admin' && pathname.startsWith(item.href));
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                isActive 
                                    ? 'bg-[#009e3e] text-white shadow-lg shadow-[#009e3e]/20' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                <LogoutConfirmationDialog />
            </div>
        </aside>
    );
}
