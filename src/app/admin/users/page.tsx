import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AddUserButton from './AddUserButton';
import UserFilters from './UserFilters';

export const revalidate = 0;

interface PageProps {
    searchParams: {
        q?: string;
        role?: string;
    };
}

export default async function AdminUsersPage(props: { searchParams: Promise<{ q?: string; role?: string }> }) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (searchParams?.q) {
        query = query.ilike('full_name', `%${searchParams.q}%`);
    }

    if (searchParams?.role && searchParams.role !== 'all') {
        query = query.eq('role', searchParams.role);
    }

    const { data: profiles } = await query;

    return (
        <div className="font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-500 mt-1">Kelola pengguna sistem</p>
                </div>
                <AddUserButton />
            </div>

            <UserFilters />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase px-6 py-4">
                        <tr>
                            <th className="px-6 py-4">Full Name (Username)</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Created At</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {profiles?.map((profile) => (
                            <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#bd7e7e]/10 text-[#bd7e7e] flex items-center justify-center font-bold text-xs">
                                            {profile.full_name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <span className="font-medium text-gray-900">{profile.full_name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${profile.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}
                                    `}>
                                        {profile.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {new Date(profile.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!profiles || profiles.length === 0) && (
                    <div className="p-8 text-center text-gray-500">
                        Tidak ada user ditemukan.
                    </div>
                )}
            </div>
        </div>
    );
}
