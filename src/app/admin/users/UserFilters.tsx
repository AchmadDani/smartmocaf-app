'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function UserFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        router.replace(`/admin/users?${params.toString()}`);
    }, 300);

    const handleRoleChange = (role: string) => {
        const params = new URLSearchParams(searchParams);
        if (role && role !== 'all') {
            params.set('role', role);
        } else {
            params.delete('role');
        }
        router.replace(`/admin/users?${params.toString()}`);
    };

    return (
        <div className="flex gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
                <input
                    type="text"
                    placeholder="Cari user..."
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('q')?.toString()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bd7e7e] outline-none text-black"
                />
                <svg className="absolute left-3 top-2.5 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </div>

            <select
                onChange={(e) => handleRoleChange(e.target.value)}
                defaultValue={searchParams.get('role')?.toString() || 'all'}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#bd7e7e] outline-none text-black bg-white"
            >
                <option value="all">Semua Role</option>
                <option value="farmer">Farmer</option>
                <option value="admin">Admin</option>
            </select>
        </div>
    );
}
