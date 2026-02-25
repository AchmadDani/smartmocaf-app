import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Server, 
  User, 
  History, 
  Settings as SettingsIcon, 
  ArrowLeft, 
  Activity,
  Circle,
  Users
} from 'lucide-react';
import Link from 'next/link';
import DeviceUserManagement from './DeviceUserManagement';
import DeviceSettingsForm from './DeviceSettingsForm';
import ActivityLog from './ActivityLog';
import AdminDeviceMqttCard from '@/components/admin/AdminDeviceMqttCard';

export const revalidate = 0;

export default async function AdminDeviceDetailPage({ params }: { params: Promise<{ deviceId: string }> }) {
    const { deviceId } = await params;
    const session = await getSession();

    if (!session) redirect('/auth/login');

    const device = await prisma.device.findUnique({
        where: { id: deviceId },
        include: {
            deviceUsers: {
                include: {
                    user: {
                        select: { id: true, fullName: true, username: true, email: true }
                    }
                },
                orderBy: { joinedAt: 'desc' }
            },
            activities: {
                include: {
                    user: {
                        select: { fullName: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            settings: true,
            _count: {
                select: { deviceUsers: true }
            }
        }
    });

    if (!device) notFound();

    // All registered users for the "Add User" dropdown
    const allUsers = await prisma.user.findMany({
        where: {
            role: 'farmer',
            isActive: true,
            id: {
                notIn: device.deviceUsers.map((du: any) => du.userId)
            }
        },
        select: { id: true, fullName: true, username: true },
        orderBy: { fullName: 'asc' }
    });

    return (
        <div className="space-y-6">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon-sm" asChild>
                    <Link href="/admin/devices">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-900">{device.name}</h1>
                        <Badge variant={device.isOnline ? "success" : "outline"} className="gap-1">
                            <Circle className={`h-2 w-2 fill-current ${device.isOnline ? "text-emerald-500" : "text-gray-400"}`} />
                            {device.isOnline ? 'Online' : 'Offline'}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-400 font-mono mt-0.5">{device.deviceCode}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Info & Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Server className="h-4 w-4 text-primary" />
                                Informasi Perangkat
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400">Terdaftar Pada</label>
                                    <p className="text-sm font-medium">
                                        {new Date(device.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400">Terakhir Dilihat</label>
                                    <p className="text-sm font-medium">
                                        {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <DeviceSettingsForm 
                                deviceId={device.id} 
                                deviceCode={device.deviceCode}
                                initialMaxUsers={device.maxUsers}
                                initialOwnerCode={device.ownerCode}
                                currentSettings={device.settings ? {
                                    targetPh: Number(device.settings.targetPh),
                                    maxHeight: (device.settings as any).maxHeight
                                } as any : null}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Activity className="h-4 w-4 text-primary" />
                                Real-time Status
                            </CardTitle>
                            <CardDescription>Status sensor perangkat saat ini</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AdminDeviceMqttCard deviceCode={device.deviceCode} deviceId={device.id} />
                        </CardContent>
                    </Card>
                </div>

                {/* Center/Right Column: Users & History */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-primary" />
                                    Pengguna Terhubung
                                </CardTitle>
                                <CardDescription>
                                    {device._count.deviceUsers} dari {device.maxUsers} slot digunakan
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DeviceUserManagement 
                                deviceId={device.id} 
                                deviceUsers={device.deviceUsers as any} 
                                availableUsers={allUsers}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <History className="h-4 w-4 text-primary" />
                                Log Aktivitas
                            </CardTitle>
                            <CardDescription>Rekam jejak kontrol dan perubahan perangkat</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ActivityLog activities={device.activities as any} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
