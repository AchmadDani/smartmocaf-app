import AdminShell from '@/components/AdminShell';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect('/auth/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId }
    });

    if (user?.role !== 'admin') {
        redirect('/farmer');
    }

    return (
        <AdminShell user={{ full_name: user?.fullName, email: user?.email }}>
            {children}
        </AdminShell>
    );
}
