'use client';

interface AdminHeaderProps {
    user: {
        full_name?: string | null;
        email?: string;
    };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
    const displayName = user.full_name || user.email?.split('@')[0] || 'Admin';
    const initial = displayName[0]?.toUpperCase() || 'A';

    return (
        <header className="bg-white px-8 py-4 border-b border-gray-100 flex justify-end items-center sticky top-0 z-10 w-full mb-8">
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#bd7e7e]/10 text-[#bd7e7e] flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                    {initial}
                </div>
            </div>
        </header>
    );
}
