import prisma from '@/lib/prisma';
import AdminDeviceList from '@/components/admin/AdminDeviceList';

export const revalidate = 0;

export default async function AdminDevicesPage() {
    const devices = await prisma.device.findMany({
        include: {
            deviceUsers: {
                include: {
                    user: {
                        select: { fullName: true }
                    }
                },
                where: { role: 'owner' }
            },
            _count: {
                select: { deviceUsers: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const devicesData = devices.map((d: any) => ({
        id: d.id,
        name: d.name,
        deviceCode: d.deviceCode,
        isOnline: d.isOnline,
        lastSeen: d.lastSeen ? d.lastSeen.toISOString() : null,
        ownerName: d.deviceUsers[0]?.user?.fullName || null,
        userCount: d._count.deviceUsers,
        createdAt: d.createdAt.toISOString()
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manajemen Perangkat</h1>
                <p className="text-sm text-gray-400 mt-0.5">Daftarkan dan kelola akses kontrol seluruh perangkat SmartMocaf</p>
            </div>
            <AdminDeviceList initialDevices={devicesData} />
        </div>
    );
}

