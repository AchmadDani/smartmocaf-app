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
    telemetry: { ph: number; temp_c: number; water_level?: number } | null;
    status: 'idle' | 'running' | 'done';
    settings: {
        target_ph: number;
        auto_drain_enabled: boolean;
    };
    role: 'OWNER' | 'VIEWER';
    mode?: 'auto' | 'manual';
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
            setLiveTelemetry({
                ph: data.ph ?? liveTelemetry?.ph,
                temp_c: data.temp ?? liveTelemetry?.temp_c,
                water_level: data.water_level ?? liveTelemetry?.water_level
            });
            if (data.mode) setLiveMode(data.mode);
            setIsDeviceOnline(true);
        }
    }, [lastMessages, mqttDeviceId, liveTelemetry]);

    const handleStart = async () => {
        const result = await showConfirm(
            'Mulai Fermentasi?',
            'Proses fermentasi akan dimulai. Pastikan singkong sudah siap dalam tangki.',
            'Ya, Mulai'
        );
        
        if (result) {
            startTransition(async () => {
                showLoading('Memulai fermentasi...');
                try {
                    await startFermentation(deviceId);
                    closeSwal();
                    showSuccess('Fermentasi Dimulai', 'Proses monitoring telah aktif.');
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
        
        if (result) {
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
        
        if (result) {
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

    const handleModeToggle = async (newMode: 'auto' | 'manual') => {
        const result = await showConfirm(
            `Mode ${newMode === 'auto' ? 'Otomatis' : 'Manual'}?`,
            newMode === 'auto'
                ? 'Keran akan dikontrol otomatis berdasarkan target pH.'
                : 'Anda akan mengontrol keran secara manual.',
            'Ya, Ubah'
        );

        if (result) {
            setLiveMode(newMode);
            if (client) {
                client.publish(`growify/${mqttDeviceId}/mode`, JSON.stringify({ mode: newMode }));
            }
            showSuccess('Mode Diubah', `Mode ${newMode === 'auto' ? 'Otomatis' : 'Manual'} aktif.`);
        }
    };

    return (
        <div className="space-y-8">
            {/* Bento Grid Sensors */}
            <div className="grid grid-cols-2 gap-5">
                <div className="bg-gradient-to-br from-orange-50/40 to-amber-50/40 p-6 rounded-[2rem] border border-orange-100/30 group hover:border-orange-200 transition-all shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Thermometer className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="text-[10px] font-black text-orange-600/70 uppercase tracking-widest">Suhu</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900 leading-none tracking-tighter">
                            {liveTelemetry?.temp_c != null ? Number(liveTelemetry.temp_c).toFixed(1) : '--'}
                        </span>
                        <span className="text-sm font-black text-gray-400 uppercase">°C</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50/40 to-indigo-50/40 p-6 rounded-[2rem] border border-blue-100/30 group hover:border-blue-200 transition-all shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Droplets className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-[10px] font-black text-blue-600/70 uppercase tracking-widest">Keasaman</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-gray-900 leading-none tracking-tighter">
                            {liveTelemetry?.ph != null ? Number(liveTelemetry.ph).toFixed(2) : '--'}
                        </span>
                        <span className="text-[11px] font-black text-blue-400 uppercase tracking-tight">pH</span>
                    </div>
                </div>

                <div className="col-span-1 bg-gradient-to-br from-emerald-50/40 to-primary/5 p-6 rounded-[2rem] border border-primary/10 group hover:border-primary/20 transition-all shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Waves className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest">Air</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-4xl font-black text-gray-900 leading-none tracking-tighter">
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
                    className={`col-span-1 bg-white p-6 rounded-[2rem] border border-gray-100 group transition-all shadow-sm ${!readonly && role === 'OWNER' ? 'cursor-pointer hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5' : ''}`}
                    onClick={() => !readonly && role === 'OWNER' && setShowPhDialog(true)}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white">
                                <Target className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target</span>
                        </div>
                        {!readonly && role === 'OWNER' && <Settings2 className="h-4 w-4 text-gray-200 group-hover:text-primary transition-colors" />}
                    </div>
                    <div className="text-4xl font-black text-gray-900 tracking-tighter">
                        {settings.target_ph.toFixed(2)}
                    </div>
                    {!readonly && role === 'OWNER' && (
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.15em] mt-3 flex items-center gap-2">
                             Update Target <ArrowRight className="h-2.5 w-2.5" />
                        </p>
                    )}
                </div>
            </div>

            {/* Controls Card */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                <Activity className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight">Kontrol Evakuasi</h3>
                        </div>
                        <Badge 
                            variant="outline"
                            className={`px-4 py-2 rounded-2xl border-0 shadow-sm h-10 cursor-pointer transition-all hover:scale-105 active:scale-95 ${liveMode === 'auto' ? 'bg-primary text-white' : 'bg-amber-500 text-white'}`}
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
                <div className="p-8 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${settings.auto_drain_enabled ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-gray-300 shadow-gray-100'}`}>
                            <Droplets className="h-7 w-7" />
                        </div>
                        <div>
                            <span className="text-base font-black text-gray-900 block leading-tight">
                                {settings.auto_drain_enabled ? 'Keran Terbuka' : 'Keran Tertutup'}
                            </span>
                            {liveMode === 'manual' ? (
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-1 block">Kontrol Manual Aktif</span>
                            ) : (
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 block">Terkunci (Otomatis)</span>
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
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                <h3 className="text-sm font-black text-gray-900 mb-8 flex items-center gap-3 uppercase tracking-widest">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    Tahapan Fermentasi
                </h3>
                <div className="space-y-10 relative ml-3">
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-100" />
                    
                    {[
                        { label: 'Sterilisasi & Persiapan', desc: 'Tangki siap dan menunggu input bahan baku', icon: Circle, done: status !== 'idle' },
                        { label: 'Inkubasi Aktif', desc: 'Monitoring sensor pH dan Suhu secara berkala', icon: Activity, active: status === 'running' },
                        { label: 'Panen & Selesai', desc: 'Kualitas singkong siap untuk proses hilirisasi', icon: CheckCircle2, done: status === 'done' }
                    ].map((step, i) => (
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
                    ))}
                </div>
            </div>

            {/* Bottom Primary Action */}
            {!readonly && role === 'OWNER' && (
                <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/95 to-transparent z-40">
                    <div className="max-w-2xl mx-auto">
                        {status === 'running' ? (
                            <Button
                                size="lg"
                                variant="destructive"
                                className="w-full h-20 rounded-[2rem] font-black text-lg shadow-2xl shadow-red-500/20 gap-4 active:scale-[0.98] transition-all border-none bg-red-600 hover:bg-red-700"
                                onClick={handleStop}
                                disabled={isPending}
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Square className="fill-white h-5 w-5" />
                                </div>
                                <span className="uppercase tracking-widest">{isPending ? 'Selesaikan...' : 'Selesaikan Batch'}</span>
                            </Button>
                        ) : (
                            <Button
                                size="lg"
                                className="w-full h-20 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/30 gap-4 active:scale-[0.98] transition-all border-none bg-gray-900 hover:bg-black"
                                onClick={handleStart}
                                disabled={isPending}
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Play className="fill-white h-5 w-5" />
                                </div>
                                <span className="uppercase tracking-widest">{isPending ? 'Memproses...' : 'Mulai Batch Baru'}</span>
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* pH Settings Dialog */}
            <Dialog open={showPhDialog} onOpenChange={setShowPhDialog}>
                <DialogContent className="sm:max-w-xs rounded-[2.5rem] p-8 border-none overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                    <DialogHeader className="relative">
                        <DialogTitle className="text-2xl font-black tracking-tight">Target pH</DialogTitle>
                        <DialogDescription className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Threshold Otomatisasi
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const val = parseFloat(formData.get('ph') as string);
                        if (!isNaN(val)) {
                            startTransition(async () => {
                                try {
                                    await updateDeviceSettings(deviceId, { target_ph: val });
                                    showSuccess('Diperbarui', `Target pH: ${val}`);
                                } catch (error) {
                                    showError('Gagal', 'Terjadi kesalahan.');
                                }
                            });
                        }
                        setShowPhDialog(false);
                    }} className="relative">
                        <div className="py-8">
                            <div className="relative group">
                                <Input 
                                    name="ph"
                                    type="number" 
                                    step="0.01" 
                                    defaultValue={settings.target_ph}
                                    className="h-24 text-center text-5xl font-black rounded-[2rem] border-gray-100 bg-gray-50 focus:ring-primary focus:border-primary transition-all pr-12" 
                                    autoFocus
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xl">pH</div>
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-start">
                            <Button type="submit" className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20">
                                Simpan Perubahan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}


