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
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
                <input
                    type="text"
                    placeholder="Cari user (nama)..."
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('q')?.toString()}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#009e3e]/20 focus:border-[#009e3e] outline-none text-gray-900 font-medium transition-all"
                />
                <svg className="absolute left-4 top-3.5 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </div>

            <select
                onChange={(e) => handleRoleChange(e.target.value)}
                defaultValue={searchParams.get('role')?.toString() || 'all'}
                className="px-6 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#009e3e]/20 focus:border-[#009e3e] outline-none text-gray-900 font-bold transition-all bg-white appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d1d5db' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")` }}
            >
                <option value="all">Semua Role</option>
                <option value="farmer">Farmer</option>
                <option value="admin">Admin</option>
            </select>
        </div>
    );
}
