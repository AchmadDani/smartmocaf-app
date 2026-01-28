'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutConfirmationDialog';

export default function AdminSidebar() {
    const pathname = usePathname();

    const menuItems = [
        {
            label: 'Dashboard', href: '/admin', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
            )
        },
        {
            label: 'Users', href: '/admin/users', icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            )
        }
    ];

    return (
        <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-20">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3">
                <div className="text-[#8B5E3C]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM6 13C6.55 13 7 13.45 7 14C7 14.55 6.55 15 6 15C5.45 15 5 14.55 5 14C5 13.45 5.45 13 6 13ZM18 13C18.55 13 19 13.45 19 14C19 14.55 18.55 15 18 15C17.45 15 17 14.55 17 14C17 13.45 17.45 13 18 13ZM12 5C14.05 5 15.93 5.76 17.41 7.03C17.75 7.32 17.78 7.82 17.49 8.16C17.2 8.5 16.7 8.53 16.36 8.24C15.17 7.21 13.65 6.6 12 6.6C10.35 6.6 8.83 7.21 7.64 8.24C7.3 8.53 6.8 8.5 6.51 8.16C6.22 7.82 6.25 7.32 6.59 7.03C8.07 5.76 9.95 5 12 5Z" />
                    </svg>
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">SmartMocaf</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</div>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-[#bd7e7e]/10 text-[#bd7e7e]'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <span className={`${isActive ? 'text-[#bd7e7e]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                {item.icon}
                            </span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-100">
                <LogoutButton />
            </div>
        </aside>
    );
}
