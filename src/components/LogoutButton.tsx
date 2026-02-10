'use client';

import { useRouter } from 'next/navigation';
import { showLogoutConfirm, showLoading, showSuccess } from '@/lib/swal';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LogoutButton({ className, children }: { className?: string; children?: React.ReactNode }) {
    const router = useRouter();

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
        <Button 
            type="button"
            variant="ghost"
            size={children ? "default" : "icon"}
            onClick={handleLogout}
            className={className || "h-11 w-11 rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all group"}
            title="Keluar"
        >
            <LogOut className={`h-5 w-5 ${children ? 'mr-2' : ''} group-hover:scale-110 transition-transform`} />
            {children && <span className="font-black uppercase text-xs tracking-widest">{children}</span>}
        </Button>
    );
}

