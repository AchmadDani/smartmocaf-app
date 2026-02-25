'use client';

import { startFermentation, stopFermentation, simulateTelemetry, updateDeviceSettings, manualDrainToggle } from "@/app/actions/device";
import { useTransition, useState, useEffect } from "react";
import { showConfirm, showSuccess, showError, showLoading, closeSwal } from "@/lib/swal";
import { useMqtt } from "@/components/MqttProvider";
import { 
    Thermometer, 
    Droplets, 
    Waves, 
    Target, 
    Play, 
    Square, 
    Settings2, 
    RefreshCw,
    Info,
    CheckCircle2,
    Circle,
    Zap,
    History,
    Activity,
    Cpu,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface MonitoringPanelProps {
    deviceId: string;
    deviceCode?: string;
    telemetry: { 
        ph: number; 
        temp_c: number; 
        water_level?: number; 
        relay?: number;
        mode?: string; // Added
        status?: string; // Added
        uptime_s?: number; // Added
        stable_time_s?: number; // Added
    } | null;
    status: 'idle' | 'running' | 'done';
    settings: {
        target_ph: number;
        auto_drain_enabled: boolean;
        max_height?: number;
        telegram_chat_id?: string;
    };
    role: 'OWNER' | 'VIEWER';
    mode?: 'auto' | 'manual' | 'test' | 'TEST' | 'MANUAL'; // Updated type
    isOnline?: boolean;
    readonly?: boolean;
}

export default function MonitoringPanel({ deviceId, deviceCode, telemetry: initialTelemetry, status, settings, role, mode: initialMode = 'auto', isOnline: initialOnline = false, readonly = false }: MonitoringPanelProps) {
    const { client, lastMessages } = useMqtt();
    const [isPending, startTransition] = useTransition();
    const [showPhDialog, setShowPhDialog] = useState(false);
    
    const [liveTelemetry, setLiveTelemetry] = useState(initialTelemetry);
    const [liveMode, setLiveMode] = useState(initialMode);
    const [isDeviceOnline, setIsDeviceOnline] = useState(initialOnline);

    const mqttDeviceId = deviceCode || deviceId;

    useEffect(() => {
        if (!client || !mqttDeviceId) return;
        const topic = `growify/${mqttDeviceId}/sensors`;
        client.subscribe(topic);
        return () => { client.unsubscribe(topic); };
    }, [client, mqttDeviceId]);

    useEffect(() => {
        const topic = `growify/${mqttDeviceId}/sensors`;
        const data = lastMessages[topic];
        if (data) {
            setLiveTelemetry(prev => ({
                ph: data.ph ?? prev?.ph,
                temp_c: data.temp ?? prev?.temp_c,
                water_level: data.water_level ?? prev?.water_level,
                relay: data.relay ?? prev?.relay,
                mode: data.mode ?? prev?.mode,
                status: data.status ?? prev?.status,
                uptime_s: data.uptime_s ?? prev?.uptime_s,
                stable_time_s: data.stable_time_s ?? prev?.stable_time_s,
            }));
            if (data.mode) setLiveMode(data.mode);
            setIsDeviceOnline(true);
        }
    }, [lastMessages, mqttDeviceId]);

    const handleStart = async () => {
        // Show custom dialog for fermentation details
        const { value: formValues } = await import('sweetalert2').then(Swal => {
            return Swal.default.fire({
                title: 'Mulai Fermentasi',
                html: `
                    <div class="text-left space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Fermentasi</label>
                            <input id="fermentation-name" type="text" class="swal2-input" placeholder="Contoh: Batch Mocaf #1" value="">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Jumlah Singkong (KG)</label>
                            <input id="cassava-amount" type="number" class="swal2-input" placeholder="Contoh: 50" min="1">
                        </div>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Mulai Fermentasi',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#009e3e',
                preConfirm: () => {
                    const name = (document.getElementById('fermentation-name') as HTMLInputElement).value;
                    const amount = (document.getElementById('cassava-amount') as HTMLInputElement).value;
                    return { name, amount: amount ? parseFloat(amount) : null };
                }
            });
        });
        
        if (formValues) {
            const mode = (liveMode === 'manual' || liveMode === 'MANUAL') ? 'manual' : 'auto';
            startTransition(async () => {
                showLoading('Memulai fermentasi...');
                try {
                    await startFermentation(deviceId, mode, formValues.name || undefined, formValues.amount || undefined);
                    closeSwal();
                    showSuccess('Fermentasi Dimulai', `Proses monitoring telah aktif untuk ${formValues.name || 'fermentasi baru'}.`);
                } catch (error) {
                    closeSwal();
                    showError('Gagal Memulai', 'Terjadi kesalahan saat memulai fermentasi.');
                }
            });
        }
    };

    const handleStop = async () => {
        const result = await showConfirm(
            'Selesaikan Fermentasi?',
            'Pastikan proses fermentasi sudah mencapai target pH yang diinginkan.',
            'Ya, Selesai'
        );
        
        if (result.isConfirmed) {
            startTransition(async () => {
                showLoading('Menyelesaikan fermentasi...');
                try {
                    await stopFermentation(deviceId);
                    closeSwal();
                    showSuccess('Fermentasi Selesai', 'Data telah disimpan ke riwayat.');
                } catch (error) {
                    closeSwal();
                    showError('Gagal', 'Terjadi kesalahan.');
                }
            });
        }
    };

    const handleToggleDrain = async (isOpen: boolean) => {
        const result = await showConfirm(
            isOpen ? 'Buka Keran?' : 'Tutup Keran?',
            isOpen ? 'Air dalam tangki akan dikeluarkan.' : 'Keran akan ditutup.',
            isOpen ? 'Ya, Buka' : 'Ya, Tutup'
        );
        
        if (result.isConfirmed) {
            startTransition(async () => {
                try {
                    await manualDrainToggle(deviceId, isOpen);
                    showSuccess(
                        isOpen ? 'Keran Dibuka' : 'Keran Ditutup',
                        isOpen ? 'Air sedang dikeluarkan.' : 'Keran telah ditutup.'
                    );
                } catch (error) {
                    showError('Gagal', 'Terjadi kesalahan.');
                }
            });
        }
    };

    const handleModeToggle = async (newMode: 'auto' | 'manual' | 'test' | 'TEST') => {
        // For farmer, only allow auto or manual (no test mode)
        if (newMode === 'test' || newMode === 'TEST') {
            showError('Mode Tidak Tersedia', 'Mode Test hanya tersedia untuk administrator.');
            return;
        }
        
        const result = await showConfirm(
            `Mode ${newMode === 'auto' ? 'Otomatis' : 'Manual'}?`,
            newMode === 'auto'
                ? 'Keran akan dikontrol otomatis berdasarkan target pH.'
                : 'Anda akan mengontrol keran secara manual.',
            'Ya, Ubah'
        );

        if (result.isConfirmed) {
            setLiveMode(newMode);
            if (client) {
                client.publish(`growify/${mqttDeviceId}/mode`, JSON.stringify({ mode: newMode }));
            }
            showSuccess('Mode Diubah', `Mode ${newMode === 'auto' ? 'Otomatis' : 'Manual'} aktif.`);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Bento Grid Sensors */}
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div className="bg-gradient-to-br from-orange-50/40 to-amber-50/40 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-orange-100/30 group hover:border-orange-200 transition-all shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Thermometer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        </div>
                        <span className="text-[10px] font-black text-orange-600/70 uppercase tracking-widest">Suhu</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-none tracking-tighter">
                            {liveTelemetry?.temp_c != null ? Number(liveTelemetry.temp_c).toFixed(1) : '--'}
                        </span>
                        <span className="text-sm font-black text-gray-400 uppercase">°C</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50/40 to-indigo-50/40 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-blue-100/30 group hover:border-blue-200 transition-all shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <span className="text-[10px] font-black text-blue-600/70 uppercase tracking-widest">Keasaman</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-none tracking-tighter">
                            {liveTelemetry?.ph != null ? Number(liveTelemetry.ph).toFixed(2) : '--'}
                        </span>
                        <span className="text-[11px] font-black text-blue-400 uppercase tracking-tight">pH</span>
                    </div>
                </div>

                <div className="col-span-1 bg-gradient-to-br from-emerald-50/40 to-primary/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-primary/10 group hover:border-primary/20 transition-all shadow-sm">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                        <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest">Air</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-3 sm:mb-4">
                        <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 leading-none tracking-tighter">
                            {liveTelemetry?.water_level != null ? liveTelemetry.water_level : '--'}
                        </span>
                        <span className="text-sm font-black text-primary uppercase">%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100/50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                        <div 
                            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000" 
                            style={{ width: `${liveTelemetry?.water_level ?? 0}%` }}
                        />
                    </div>
                </div>

                <div 
                    className={`col-span-1 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-gray-100 group transition-all shadow-sm ${!readonly && role === 'OWNER' ? 'cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5' : ''}`}
                    onClick={() => !readonly && role === 'OWNER' && setShowPhDialog(true)}
                >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white">
                                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target</span>
                        </div>
                        {!readonly && role === 'OWNER' && <Settings2 className="h-4 w-4 text-gray-200 group-hover:text-primary transition-colors" />}
                    </div>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter">
                        {settings.target_ph.toFixed(2)}
                    </div>
                    {!readonly && role === 'OWNER' && (
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.15em] mt-2 sm:mt-3 flex items-center gap-2">
                             Update Target <ArrowRight className="h-2.5 w-2.5" />
                        </p>
                    )}
                </div>
            </div>

            {/* Controls Card */}
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                <div className="p-4 sm:p-8 border-b border-gray-50/50 bg-gray-50/30">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">Kontrol Evakuasi</h3>
                        </div>
                        <Badge
                            variant="outline"
                            className={`px-4 py-2 rounded-2xl border-0 shadow-lg h-10 cursor-pointer transition-all hover:scale-105 active:scale-95 ${liveMode === 'auto' ? 'bg-primary text-white shadow-primary/20' : 'bg-amber-500 text-white shadow-amber-500/20'}`}
                            onClick={() => !readonly && role === 'OWNER' && handleModeToggle(liveMode === 'auto' ? 'manual' : 'auto')}
                        >
                            {liveMode === 'auto' ? <Zap className="h-3 w-3 mr-2" /> : <Settings2 className="h-3 w-3 mr-2" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{liveMode === 'auto' ? 'Mode Otomatis' : 'Mode Manual'}</span>
                        </Badge>
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                        {liveMode === 'auto' ? 'Sistem akan membuka keran otomatis saat target pH tercapai.' : 'Peringatan: Pembuangan air kini dikontrol secara manual oleh anda.'}
                    </p>
                </div>
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                        {/* Uptime Badge */}
                        <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full border border-gray-100/50 shadow-sm">
                            <Activity className="w-3 h-3 text-gray-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-600 tracking-wide">
                                {liveTelemetry?.uptime_s ? `${Math.floor(liveTelemetry.uptime_s / 3600)}h ${Math.floor((liveTelemetry.uptime_s % 3600) / 60)}m` : "Offline"}
                            </span>
                        </div>
                        {/* Status Badge */}
                        <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full border shadow-sm ${
                            liveTelemetry?.status === 'FERMENT' ? 'bg-blue-100 border-blue-200 text-blue-700' :
                            liveTelemetry?.status === 'STABLE' ? 'bg-yellow-100 border-yellow-200 text-yellow-700' :
                            liveTelemetry?.status === 'DRAIN' ? 'bg-red-100 border-red-200 text-red-700' :
                            liveTelemetry?.status === 'TEST' ? 'bg-purple-100 border-purple-200 text-purple-700' :
                            liveTelemetry?.status === 'MANUAL' ? 'bg-amber-100 border-amber-200 text-amber-700' :
                            'bg-gray-100 border-gray-200 text-gray-600'
                        }`}>
                            <span className="text-[10px] font-black uppercase tracking-wider">
                                {liveTelemetry?.status === 'FERMENT' ? 'FERMENTASI' :
                                 liveTelemetry?.status === 'STABLE' ? 'STABILISASI' :
                                 liveTelemetry?.status === 'DRAIN' ? 'KURAS' :
                                 liveTelemetry?.status === 'TEST' ? 'TEST MODE' :
                                 liveTelemetry?.status === 'MANUAL' ? 'MANUAL' : 'IDLE'}
                            </span>
                        </div>
                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 ${settings.auto_drain_enabled ? 'bg-blue-600 text-white shadow-blue-500/30 ring-4 ring-blue-50' : 'bg-white text-gray-200 shadow-gray-200 border border-gray-100'}`}>
                            <Droplets className="h-5 w-5 sm:h-7 sm:w-7" />
                        </div>
                        <div>
                            <span className={`text-sm sm:text-base font-black block leading-tight ${settings.auto_drain_enabled || liveTelemetry?.relay === 1 ? 'text-blue-600' : 'text-gray-900'}`}>
                                {settings.auto_drain_enabled || liveTelemetry?.relay === 1 ? 'Keran Terbuka' : 'Keran Tertutup'}
                            </span>
                            {liveTelemetry?.relay === 1 ? (
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                    </span>
                                    <span className="hidden sm:inline">Sedang Menguras...</span>
                                </span>
                            ) : liveMode === 'manual' ? (
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1 block">Kontrol Manual Aktif</span>
                            ) : status === 'idle' ? (
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 block">Terkunci (Otomatis)</span>
                            ) : (
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 block">Otomatisasi Aktif</span>
                            )}
                        </div>
                    </div>
                    {!readonly && role === 'OWNER' && (
                        <Switch 
                            checked={settings.auto_drain_enabled} 
                            onCheckedChange={handleToggleDrain}
                            disabled={isPending || liveMode === 'auto'}
                            className="scale-125 data-[state=checked]:bg-blue-600"
                        />
                    )}
                </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-gray-100 p-4 sm:p-8 shadow-sm">
                <h3 className="text-sm font-black text-gray-900 mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3 uppercase tracking-widest">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                         <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    Tahapan Fermentasi
                </h3>
                <div className="space-y-10 relative ml-3">
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-100" />
                    
                    {(() => {
                        // Determine step states from live MQTT status
                        const liveStatus = liveTelemetry?.status || '';
                        const isRunning = status === 'running' || ['FERMENT', 'STABLE', 'DRAIN'].includes(liveStatus);
                        const isDone = status === 'done';
                        const isFermenting = liveStatus === 'FERMENT';
                        const isStabilizing = liveStatus === 'STABLE';
                        const isDraining = liveStatus === 'DRAIN';
                        
                        const steps = [
                            { 
                                label: 'Sterilisasi & Persiapan', 
                                desc: 'Tangki siap dan menunggu input bahan baku', 
                                icon: Circle, 
                                done: isRunning || isDone, 
                                active: false 
                            },
                            { 
                                label: 'Inkubasi Aktif', 
                                desc: isFermenting 
                                    ? 'Monitoring pH... Menunggu target tercapai' 
                                    : isStabilizing 
                                        ? `Stabilisasi pH${liveTelemetry?.stable_time_s ? ` (${Math.floor(liveTelemetry.stable_time_s / 60)}m)` : ''}` 
                                        : 'Monitoring sensor pH dan Suhu secara berkala', 
                                icon: Activity, 
                                active: isFermenting || isStabilizing, 
                                done: isDraining || isDone 
                            },
                            { 
                                label: isDraining ? 'Sedang Menguras...' : 'Panen & Selesai', 
                                desc: isDraining 
                                    ? 'Keran terbuka, air sedang dibuang' 
                                    : 'Kualitas singkong siap untuk proses hilirisasi', 
                                icon: CheckCircle2, 
                                active: isDraining, 
                                done: isDone 
                            }
                        ];
                        
                        return steps.map((step, i) => (
                            <div key={i} className="flex items-start gap-6 relative group">
                                <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center z-10 bg-white transition-all duration-500
                                    ${step.active ? 'border-primary shadow-[0_0_15px_rgba(34,197,94,0.3)] ring-4 ring-primary/10' : step.done ? 'border-primary bg-primary' : 'border-gray-50'}`}
                                >
                                    {step.done ? <CheckCircle2 className="h-4 w-4 text-white" /> : <step.icon className={`h-4 w-4 ${step.active ? 'text-primary animate-pulse' : 'text-gray-100'}`} />}
                                </div>
                                <div className="pt-0.5">
                                    <p className={`text-base font-black tracking-tight ${step.active || step.done ? 'text-gray-900' : 'text-gray-300'}`}>{step.label}</p>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-1">{step.desc}</p>
                                </div>
                            </div>
                        ));
                    })()}
                </div>
            </div>

            {/* FERMENTATION CONTROL */}
            <div className="grid grid-cols-2 gap-4 mt-6">
                <Button 
                    onClick={() => {
                        if (client) client.publish(`growify/${mqttDeviceId}/control`, JSON.stringify({ relay: "3" }));
                    }}
                    disabled={liveTelemetry?.status !== 'IDLE'}
                    className={`h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all ${
                        liveTelemetry?.status !== 'IDLE' ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-emerald-500/30'
                    }`}
                >
                    Mulai Fermentasi
                </Button>
                <Button 
                    onClick={() => {
                        if (client) client.publish(`growify/${mqttDeviceId}/control`, JSON.stringify({ relay: "4" }));
                    }}
                    disabled={liveTelemetry?.status === 'IDLE'}
                    className={`h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all ${
                        liveTelemetry?.status === 'IDLE' ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-500/30'
                    }`}
                >
                    Stop Proses
                </Button>
            </div>

            {/* Manual Control (Only in Manual Mode) */}
            {(liveMode === 'manual' || liveMode === 'MANUAL' || liveTelemetry?.mode === 'manual') && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-3 uppercase tracking-widest">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Settings2 className="h-4 w-4 text-amber-500" />
                        </div>
                        Kontrol Manual
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Button 
                            onClick={() => {
                                if (client) client.publish(`growify/${mqttDeviceId}/control`, JSON.stringify({ relay: "1" }));
                            }}
                            disabled={liveTelemetry?.relay === 1}
                            className={`h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all ${
                                liveTelemetry?.relay === 1 ? 'bg-blue-100 text-blue-400' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-blue-500/30'
                            }`}
                        >
                            Buka Keran
                        </Button>
                        <Button 
                            onClick={() => {
                                if (client) client.publish(`growify/${mqttDeviceId}/control`, JSON.stringify({ relay: "0" }));
                            }}
                            disabled={liveTelemetry?.relay === 0}
                            className={`h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-all ${
                                liveTelemetry?.relay === 0 ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-red-500/30'
                            }`}
                        >
                            Tutup Keran
                        </Button>
                    </div>
                </div>
            )}

            {/* Bottom Primary Action */}
            {/* Removed as per instruction */}

            {/* pH Settings Dialog */}
            <Dialog open={showPhDialog} onOpenChange={setShowPhDialog}>
                <DialogContent className="sm:max-w-xs rounded-[2.5rem] p-8 border-none overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                    <DialogHeader className="relative">
                        <DialogTitle className="text-2xl font-black tracking-tight">Konfigurasi</DialogTitle>
                        <DialogDescription className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Parameter Sistem
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const phVal = parseFloat(formData.get('ph') as string);
                        const heightVal = parseFloat(formData.get('height') as string);
                        const chatIdVal = formData.get('chat_id') as string;
                        
                        startTransition(async () => {
                            try {
                                const payload: any = {};
                                if (!isNaN(phVal)) payload.target_ph = phVal;
                                if (!isNaN(heightVal)) payload.max_height = heightVal;
                                if (chatIdVal && chatIdVal.trim() !== "") payload.telegram_chat_id = chatIdVal;

                                await updateDeviceSettings(deviceId, payload);
                                if (client) {
                                    client.publish(`growify/${mqttDeviceId}/config`, JSON.stringify(payload));
                                }
                                showSuccess('Diperbarui', 'Konfigurasi tersimpan.');
                            } catch (error) {
                                showError('Gagal', 'Terjadi kesalahan.');
                            }
                        });
                        setShowPhDialog(false);
                    }} className="relative">
                        <div className="py-6 space-y-6">
                            <div className="relative group">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block pl-1">Target pH</Label>
                                <div className="relative">
                                    <Input 
                                        name="ph"
                                        type="number" 
                                        step="0.01" 
                                        defaultValue={settings.target_ph}
                                        className="h-16 text-center text-3xl font-black rounded-2xl border-gray-100 bg-gray-50 focus:ring-primary focus:border-primary transition-all pr-12" 
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-black text-sm">pH</div>
                                </div>
                            </div>

                            <div className="relative group">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block pl-1">Tinggi Tangki (cm)</Label>
                                <div className="relative">
                                    <Input 
                                        name="height"
                                        type="number" 
                                        step="1" 
                                        defaultValue={settings.max_height || 50}
                                        placeholder="50"
                                        className="h-16 text-center text-3xl font-black rounded-2xl border-gray-100 bg-gray-50 focus:ring-primary focus:border-primary transition-all pr-12" 
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-black text-sm">CM</div>
                                </div>
                            </div>
                            <div className="relative group">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block pl-1">Telegram Chat ID</Label>
                                <Input 
                                    name="chat_id"
                                    type="text" 
                                    defaultValue={settings.telegram_chat_id || ''}
                                    placeholder="-45345..."
                                    className="h-16 text-center text-sm font-bold rounded-2xl border-gray-100 bg-gray-50 focus:ring-primary focus:border-primary transition-all" 
                                />
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-start">
                            <Button type="submit" className="w-full h-14 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20">
                                Simpan Konfigurasi
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}


