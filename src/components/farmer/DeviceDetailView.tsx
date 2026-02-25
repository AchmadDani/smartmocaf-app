'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MonitoringPanel from './MonitoringPanel';
import HistoryCard from './HistoryCard';
import DeleteDeviceDialog from './DeleteDeviceDialog';
import { 
    ChevronLeft, 
    History, 
    Settings2, 
    Activity,
    Info,
    Clock,
    Cpu,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from '@/components/ui/badge';
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';

interface DeviceDetailViewProps {
    device: any;
    settings: any;
    telemetry: any;
    status: 'idle' | 'running' | 'done';
    history: any[];
    role: 'OWNER' | 'VIEWER';
    readonly?: boolean;
}

export default function DeviceDetailView({ device, settings, telemetry, status, history, role, readonly = false }: DeviceDetailViewProps) {
    const router = useRouter();

    return (
        <div className={`min-h-screen bg-[#FAFAFA] font-sans pb-12 ${readonly ? 'w-full' : ''}`}>
            <div className={`w-full mx-auto min-h-screen flex flex-col`}>
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 h-16 sm:h-[80px] flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                        >
                            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-primary transition-colors" />
                        </Button>
                        <div className="flex items-center gap-2 sm:gap-2.5">
                            <div className="relative w-8 h-8 sm:w-9 sm:h-9">
                                <Image 
                                    src="/assets/images/logos/Logo Growify Tech + Smart Mocaf.png" 
                                    alt="SmartMocaf" 
                                    fill
                                    className="object-contain"
                                />
                            </div>
                            <h2 className="text-sm font-black tracking-tight text-gray-900 hidden sm:block">Control Panel</h2>
                        </div>
                    </div>
                    {!readonly && role === 'OWNER' && <DeleteDeviceDialog deviceId={device.id} deviceName={device.name} />}
                </header>

                {/* Device Info Header */}
                <div className="px-4 sm:px-6 py-6 sm:py-10 bg-white border-b border-gray-100/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                        <div className="flex items-center gap-4 sm:gap-5">
                            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.75rem] flex items-center justify-center transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
                                device.isOnline ? 'bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50' : 'bg-gray-100 text-gray-400'
                            }`}>
                                <Cpu className="h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 sm:gap-3 mb-1">
                                    <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight leading-none">{device.name}</h1>
                                    {role === 'VIEWER' && (
                                        <Badge variant="secondary" className="text-[9px] font-black px-2 py-0.5 uppercase tracking-widest rounded-lg bg-gray-100 text-gray-500">Shared</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">
                                    <span className="font-mono bg-gray-50/80 px-2 py-0.5 rounded-md border border-gray-100/50">{device.deviceCode || device.id.slice(0, 8)}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200 hidden sm:block" />
                                    <div className="flex items-center gap-1.5 hidden sm:flex">
                                        <Clock className="h-3 w-3" />
                                        <span>Aktif {device.createdAt ? new Date(device.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Badge variant="outline" className={`gap-2 sm:gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl border-0 shadow-sm h-10 sm:h-12 transition-all group ${device.isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                            <div className={`w-2 h-2 rounded-full ${device.isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-gray-300'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{device.isOnline ? 'System Online' : 'Offline Mode'}</span>
                        </Badge>
                    </div>
                </div>

                {/* Main Content with Tabs */}
                <Tabs defaultValue="monitoring" className="flex-1 flex flex-col pt-6 sm:pt-10">
                    <div className="px-4 sm:px-6 mb-6 sm:mb-10">
                        <TabsList className="w-full h-12 sm:h-14 bg-gray-200/30 p-1.5 rounded-2xl sm:rounded-[1.75rem] border border-gray-100/50 backdrop-blur-sm">
                            <TabsTrigger value="monitoring" className="flex-1 rounded-xl sm:rounded-[1.25rem] text-xs sm:text-sm uppercase tracking-widest font-black gap-2 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_20px_rgba(0,0,0,0.06)] data-[state=active]:text-primary transition-all duration-300">
                                <Activity className="h-4 w-4" />
                                <span className="hidden sm:inline">Real-time</span> Monitoring
                            </TabsTrigger>
                            <TabsTrigger value="history" className="flex-1 rounded-xl sm:rounded-[1.25rem] text-xs sm:text-sm uppercase tracking-widest font-black gap-2 data-[state=active]:bg-white data-[state=active]:shadow-[0_8px_20px_rgba(0,0,0,0.06)] data-[state=active]:text-primary transition-all duration-300">
                                <History className="h-4 w-4" />
                                Batch History
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="monitoring" className="flex-1 px-4 sm:px-6 pb-24 sm:pb-32 focus-visible:outline-none">
                        <MonitoringPanel
                            deviceId={device.id}
                            deviceCode={device.deviceCode}
                            telemetry={telemetry}
                            status={status}
                            settings={settings}
                            role={role}
                            readonly={readonly}
                        />
                    </TabsContent>

                    <TabsContent value="history" className="flex-1 px-4 sm:px-6 pb-24 sm:pb-32 focus-visible:outline-none">
                        <div className="space-y-4 sm:space-6">
                            {history && history.length > 0 ? (
                                history.map((item) => (
                                    <HistoryCard key={item.id} item={item} />
                                ))
                            ) : (
                                <div className="py-16 sm:py-24 px-6 sm:px-8 bg-white rounded-2xl sm:rounded-[2.5rem] border border-gray-100 text-center shadow-sm">
                                    <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gray-50 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-dashed border-gray-200">
                                        <History className="h-7 w-7 sm:h-10 sm:w-10 text-gray-200" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight mb-2">Belum Ada Riwayat</h3>
                                    <p className="text-[10px] sm:text-xs font-black text-gray-300 uppercase tracking-widest max-w-[250px] mx-auto leading-relaxed">
                                        Data batch fermentasi yang telah selesai akan otomatis diarsipkan di sini.
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}


