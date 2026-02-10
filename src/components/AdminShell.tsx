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
        <div className="min-h-screen bg-[#F5F5F5]">
            <AdminSidebar 
                isOpen={sidebarOpen} 
                isCollapsed={isCollapsed}
                onClose={() => setSidebarOpen(false)} 
                onToggleCollapse={toggleCollapse}
            />

            <div className={`flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-64'}`}>
                <AdminHeader user={user} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 pt-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
