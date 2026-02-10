'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';

interface AdminShellProps {
    user: { full_name?: string | null; email?: string };
    children: React.ReactNode;
}

export default function AdminShell({ user, children }: AdminShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebarCollapsed') === 'true';
        }
        return false;
    });

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', String(newState));
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <AdminSidebar 
                isOpen={sidebarOpen} 
                isCollapsed={isCollapsed}
                onClose={() => setSidebarOpen(false)} 
                onToggleCollapse={toggleCollapse}
            />

            <div className={`
                flex flex-col min-h-screen transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) 
                ${isCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'}
            `}>
                <AdminHeader user={user} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 px-4 sm:px-8 lg:px-10 pb-12 pt-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

