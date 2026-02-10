import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AddUserButton from './AddUserButton';
import UserFilters from './UserFilters';
import AdminUserList from './AdminUserList';

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
                    <p className="text-sm text-gray-400 mt-0.5">Kelola akses dan akun seluruh pengguna SmartMocaf</p>
                </div>
                <AddUserButton />
            </div>

            <UserFilters />

            <AdminUserList profiles={profiles as any} />
        </div>
    );
}

