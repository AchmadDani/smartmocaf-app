'use client';

import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  Settings2, 
  UserPlus, 
  UserMinus, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  KeyRound,
  MonitorSmartphone
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Activity {
    id: string;
    action: string;
    detail: any;
    createdAt: Date;
    user: {
        fullName: string;
    } | null;
}

const ACTION_MAP: Record<string, { label: string, color: string, icon: any }> = {
    'START_FERMENTATION': { label: 'Fermentasi Dimulai', color: 'success', icon: Play },
    'STOP_FERMENTATION': { label: 'Fermentasi Selesai', color: 'purple', icon: Square },
    'SETTINGS_UPDATE': { label: 'Update Pengaturan', color: 'info', icon: Settings2 },
    'USER_ADDED': { label: 'Pengguna Ditambah', color: 'info', icon: UserPlus },
    'USER_REMOVED': { label: 'Pengguna Dilepas', color: 'warning', icon: UserMinus },
    'USER_ROLE_UPDATED': { label: 'Role Diubah', color: 'info', icon: Shield },
    'DEVICE_CLAIMED': { label: 'Alat Diklaim', color: 'success', icon: CheckCircle2 },
    'DEVICE_CREATED': { label: 'Alat Dibuat', color: 'success', icon: MonitorSmartphone },
    'OWNER_CODE_UPDATED': { label: 'Kode Owner Diubah', color: 'info', icon: KeyRound },
    'DRAIN_OPEN': { label: 'Buka Keran', color: 'warning', icon: AlertCircle },
    'DRAIN_CLOSE': { label: 'Tutup Keran', color: 'info', icon: CheckCircle2 },
};

function formatDetail(detail: any): string {
    if (!detail) return '-';
    try {
        const d = typeof detail === 'string' ? JSON.parse(detail) : detail;
        const parts: string[] = [];
        
        if (d.name) parts.push(`Nama: ${d.name}`);
        if (d.targetPH) parts.push(`Target pH: ${d.targetPH}`);
        if (d.maxHeight) parts.push(`Tinggi: ${d.maxHeight}cm`);
        if (d.mode) parts.push(`Mode: ${d.mode}`);
        if (d.role) parts.push(`Role: ${d.role.toUpperCase()}`);
        if (d.newRole) parts.push(`Role: ${d.newRole.toUpperCase()}`);
        if (d.ownerCode) parts.push(`Owner Code: ${d.ownerCode}`);
        if (d.targetUserId) parts.push(`User ID: ${d.targetUserId.substring(0, 8)}...`);
        
        return parts.length > 0 ? parts.join(' • ') : JSON.stringify(d);
    } catch {
        return String(detail);
    }
}

export default function ActivityLog({ activities }: { activities: Activity[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(activities.length / itemsPerPage);
    const paginatedActivities = activities.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-4">
            {activities.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-8 italic">
                    Belum ada riwayat aktivitas yang tercatat.
                </p>
            )}
            
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {paginatedActivities.map((activity) => {
                    const config = ACTION_MAP[activity.action] || { label: activity.action, color: 'outline', icon: AlertCircle };
                    const Icon = config.icon;

                    return (
                        <div key={activity.id.toString()} className="relative">
                            {/* Dot on the line */}
                            <div className={`absolute -left-[1.65rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-gray-200 ring-2 ring-gray-100 ${
                                activity.action.includes('START') || activity.action.includes('CLAIM') ? 'bg-emerald-500' : 
                                activity.action.includes('STOP') ? 'bg-purple-500' : 'bg-blue-500'
                            }`} />
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={config.color as any} className="gap-1 px-1.5 py-0">
                                            <Icon className="h-3 w-3" />
                                            {config.label}
                                        </Badge>
                                        <span className="text-xs font-bold text-gray-700">
                                            {activity.user ? activity.user.fullName : 'Sistem/Admin'}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-gray-400 flex items-center gap-2">
                                        <span>
                                            {new Date(activity.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {new Date(activity.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-[10px] bg-gray-50 px-2 py-1 rounded border border-gray-100 max-w-[200px] truncate">
                                    {formatDetail(activity.detail)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 pt-4 border-t border-gray-50 mt-4">
                    <p className="text-[10px] text-gray-400">
                        Menampilkan <span className="font-bold text-gray-600">{paginatedActivities.length}</span> dari <span className="font-bold text-gray-600">{activities.length}</span> aktivitas
                    </p>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-7 w-7"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        <div className="flex items-center px-3 text-[10px] font-bold text-gray-500 bg-gray-50 rounded-md border">
                            {currentPage} / {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-7 w-7"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
