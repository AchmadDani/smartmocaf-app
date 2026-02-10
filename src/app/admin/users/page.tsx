import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AddUserButton from './AddUserButton';
import UserFilters from './UserFilters';
import DeleteUserButton from './DeleteUserButton';
import { Prisma } from '@prisma/client';

export const revalidate = 0;

export default async function AdminUsersPage(props: { searchParams: Promise<{ q?: string; role?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await getSession();

    if (!session) redirect('/auth/login');

    const where: any = {};

    if (searchParams?.q) {
        where.fullName = {
            contains: searchParams.q
        };
    }

    if (searchParams?.role && searchParams.role !== 'all') {
        where.role = searchParams.role as any;
    }

    const profiles = await prisma.user.findMany({
        where,
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
                    <p className="text-gray-500 mt-1">Kelola akses dan akun seluruh pengguna SmartMocaf</p>
                </div>
                <AddUserButton />
            </div>

            <UserFilters />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        Semua Pengguna
                    </h2>
                    <span className="text-sm text-gray-400 font-medium">Total: {profiles.length}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/80 text-gray-500 font-bold text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Nama & Akun</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Terdaftar</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {profiles.map((profile: any) => (
                                <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#009e3e]/10 text-[#009e3e] flex items-center justify-center font-bold border border-[#009e3e]/20 uppercase">
                                                {profile.fullName?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <span className="block font-bold text-gray-900">{profile.fullName}</span>
                                                <span className="text-xs text-gray-400 font-medium">@{profile.username || profile.id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                                            ${profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-[#009e3e]/10 text-[#009e3e]'}
                                        `}>
                                            {profile.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-gray-500 text-sm font-medium">
                                            {new Date(profile.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <DeleteUserButton userId={profile.id} userName={profile.fullName || 'User'} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {profiles.length === 0 && (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <h3 className="text-gray-900 font-bold">Pengguna tidak ditemukan</h3>
                            <p className="text-gray-500 text-sm mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
