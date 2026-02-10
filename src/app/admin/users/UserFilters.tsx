'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, User } from 'lucide-react';

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
        <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Cari user (nama)..."
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get('q')?.toString()}
                    className="pl-9"
                />
            </div>

            <div className="flex items-center gap-2">
                <Select
                    onValueChange={handleRoleChange}
                    defaultValue={searchParams.get('role')?.toString() || 'all'}
                >
                    <SelectTrigger className="w-[180px] gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <SelectValue placeholder="Semua Role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Role</SelectItem>
                        <SelectItem value="farmer">Farmer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

