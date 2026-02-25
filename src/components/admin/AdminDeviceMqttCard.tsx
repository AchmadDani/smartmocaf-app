'use client';

import { useEffect, useState } from 'react';
import { useMqtt } from '@/components/MqttProvider';
import { adminLogActivity } from '@/app/actions/admin';
import { 
    Thermometer, Droplets, Waves, Cpu, Ruler, Activity,
    Power, PowerOff, Play, Square, Settings2, ToggleLeft, ToggleRight, Loader2, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';

interface AdminDeviceMqttCardProps {
    deviceCode: string;
    deviceId: string;
}

export default function AdminDeviceMqttCard({ deviceCode, deviceId }: AdminDeviceMqttCardProps) {
    const { client, lastMessages } = useMqtt();
    const [data, setData] = useState<any>(null);
    const [sending, setSending] = useState(false);
    const [showApiTestDialog, setShowApiTestDialog] = useState(false);

    useEffect(() => {
        if (!client || !deviceCode) return;
        const topic = `growify/${deviceCode}/sensors`;
        client.subscribe(topic);
        return () => { client.unsubscribe(topic); };
    }, [client, deviceCode]);

    useEffect(() => {
        const topic = `growify/${deviceCode}/sensors`;
        const liveData = lastMessages[topic];
        if (liveData) setData(liveData);
    }, [lastMessages, deviceCode]);

    const publish = (topic: string, payload: object) => {
        if (!client) return;
        setSending(true);
        client.publish(`growify/${deviceCode}/${topic}`, JSON.stringify(payload));
        
        // Log to activity database
        let action = '';
        if (topic === 'mode') {
            if ((payload as any).mode) action = (payload as any).mode.toUpperCase() + '_MODE';
            if ((payload as any).action) action = (payload as any).action.toUpperCase() + '_FERMENTATION';
        } else if (topic === 'control') {
            if ((payload as any).relay === 'on') action = 'DRAIN_OPEN';
            if ((payload as any).relay === 'off') action = 'DRAIN_CLOSE';
        }

        if (action) {
            // Kita gak perlu await biar gak ngeblock UI
            adminLogActivity(deviceId, action, payload);
        }

        // Tunggu 4 detik agar status MQTT terupdate sebelum tombol aktif lagi
        setTimeout(() => setSending(false), 4000);
    };

    const currentMode = data?.mode?.toLowerCase() || 'auto';
    const relayOn = data?.relay === 1;

    // === EMPTY STATE ===
    if (!data) {
        return (
            <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border border-dashed border-gray-200 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-5 w-5 text-gray-300 animate-pulse" />
                </div>
                <p className="text-sm text-gray-400 font-bold">Menunggu data MQTT...</p>
                <p className="text-[10px] text-gray-300 mt-1 font-mono">growify/{deviceCode}/sensors</p>
            </div>
        );
    }

    const metrics = [
        { label: 'Suhu',  value: data.temp != null ? `${Number(data.temp).toFixed(1)}°C` : '--',  icon: Thermometer, color: 'text-orange-600 bg-orange-50 border-orange-100' },
        { label: 'pH',    value: data.ph != null ? Number(data.ph).toFixed(2) : '--',             icon: Droplets,    color: 'text-blue-600 bg-blue-50 border-blue-100' },
        { label: 'Air',   value: data.water_level != null ? `${Number(data.water_level).toFixed(0)}%` : '--', icon: Waves, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        { label: 'ESP32', value: data.temp_device != null ? `${Number(data.temp_device).toFixed(1)}°C` : '--', icon: Cpu,  color: 'text-red-500 bg-red-50 border-red-100' },
        { label: 'Jarak', value: data.distance_cm != null ? `${Number(data.distance_cm).toFixed(1)}cm` : '--', icon: Ruler, color: 'text-violet-600 bg-violet-50 border-violet-100', wide: true },
    ];

    const modes = [
        { key: 'auto',   label: 'AUTO',   color: 'bg-emerald-500 hover:bg-emerald-600 text-white', inactive: 'bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 border-gray-200' },
        { key: 'manual', label: 'MANUAL', color: 'bg-amber-500 hover:bg-amber-600 text-white',     inactive: 'bg-gray-50 hover:bg-amber-50 text-gray-500 hover:text-amber-600 border-gray-200' },
    ];

    const statusColors: Record<string, string> = {
        idle: 'bg-gray-100 text-gray-500',
        fermentation: 'bg-blue-100 text-blue-700',
        fermenting: 'bg-blue-100 text-blue-700',
        stabilizing: 'bg-amber-100 text-amber-700',
        draining: 'bg-red-100 text-red-700',
    };

    return (
        <div className="space-y-5">
            {/* === STATUS BADGES === */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Live</span>
                </div>
                {data.status && (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[data.status?.toLowerCase()] || 'bg-gray-100 text-gray-500'}`}>
                        {data.status}
                    </span>
                )}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${relayOn ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                    {relayOn ? <ToggleRight className="h-3 w-3 inline mr-1" /> : <ToggleLeft className="h-3 w-3 inline mr-1" />}
                    Relay {relayOn ? 'ON' : 'OFF'}
                </span>
                {data.uptime_s != null && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 ml-auto">
                        ⏱ {Math.floor(data.uptime_s / 3600)}h {Math.floor((data.uptime_s % 3600) / 60)}m
                    </span>
                )}
            </div>

            {/* === SENSOR GRID === */}
            <div className="grid grid-cols-2 gap-3">
                {metrics.map((m, i) => (
                    <div 
                        key={i} 
                        className={`
                            ${(m as any).wide ? 'col-span-2 flex-row gap-4 px-4' : 'flex-col items-center justify-center'} 
                            flex p-3 rounded-xl border ${m.color} transition-all
                        `}
                    >
                        <div className={`p-2 rounded-full mb-0 ${(m as any).wide ? '' : 'mb-2'} ${m.color.replace('border-', 'bg-').replace('text-', 'bg-opacity-20 text-')}`}>
                            <m.icon className="h-5 w-5" />
                        </div>
                        <div className={(m as any).wide ? 'text-left' : 'text-center'}>
                            <p className="text-lg font-black leading-none text-gray-900">{m.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-60 text-center">{m.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Separator className="bg-gray-100" />

            {/* === CONTROLS === */}
            <div className="flex flex-col xl:flex-row gap-4">
                {/* Mode Selector */}
                <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Mode</p>
                    <div className="flex gap-2">
                        {modes.map(m => (
                            <button
                                key={m.key}
                                onClick={() => publish('mode', { mode: m.key })}
                                disabled={sending}
                                className={`flex-1 py-2.5 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shadow-sm flex items-center justify-center gap-1.5 ${
                                    currentMode === m.key 
                                        ? m.color + ' border-transparent scale-[1.02]' 
                                        : m.inactive
                                } disabled:opacity-50 disabled:scale-100 disabled:cursor-wait`}
                            >
                                {sending && currentMode !== m.key && <Loader2 className="h-3 w-3 animate-spin"/>}
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Relay Control */}
                <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Keran / Relay {currentMode !== 'manual' && '(Manual Only)'}</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => publish('control', { relay: 'on' })}
                            disabled={sending || relayOn || currentMode !== 'manual'}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-2 shadow-sm ${
                                relayOn 
                                    ? 'bg-blue-500 text-white border-transparent' 
                                    : 'bg-white hover:bg-blue-50 text-gray-500 hover:text-blue-600 border-gray-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {sending && !relayOn && <Loader2 className="h-3 w-3 animate-spin"/>}
                            {!sending && <Power className="h-3.5 w-3.5" />}
                            BUKA
                        </button>
                        <button
                            onClick={() => publish('control', { relay: 'off' })}
                            disabled={sending || !relayOn || currentMode !== 'manual'}
                            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-2 shadow-sm ${
                                !relayOn 
                                    ? 'bg-gray-600 text-white border-transparent' 
                                    : 'bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 border-gray-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {sending && relayOn && <Loader2 className="h-3 w-3 animate-spin"/>}
                            {!sending && <PowerOff className="h-3.5 w-3.5" />}
                            TUTUP
                        </button>
                    </div>
                </div>
            </div>

            {/* === FERMENTATION ACTIONS === */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Fermentasi</p>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={() => publish('mode', { action: 'start' })}
                        disabled={sending || data.status?.toLowerCase() !== 'idle'}
                        className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-1.5"
                    >
                        {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                        Mulai Fermentasi
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => publish('mode', { action: 'stop' })}
                        disabled={sending || data.status?.toLowerCase() === 'idle'}
                        className="flex-1 h-9 rounded-xl text-xs font-bold gap-1.5 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                        {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Square className="h-3.5 w-3.5" />}
                        Stop Fermentasi
                    </Button>
                </div>
            </div>

            {/* === API TEST === */}
            <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Diagnostik</p>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowApiTestDialog(true)}
                    className="w-full h-9 rounded-xl text-xs font-bold gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                    <Settings2 className="h-3.5 w-3.5" />
                    Konfigurasi & Test API
                </Button>
            </div>

            {/* === API TEST DIALOG === */}
            <Dialog open={showApiTestDialog} onOpenChange={setShowApiTestDialog}>
                <DialogContent className="sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black">Konfigurasi API Perangkat</DialogTitle>
                        <DialogDescription className="text-xs text-gray-400">
                            Atur endpoint API dan test upload data telemetry dari perangkat.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const apiHost = formData.get('api_host') as string;
                        const apiPort = parseInt(formData.get('api_port') as string);
                        
                        const configPayload: any = {};
                        if (apiHost.trim()) configPayload.api_host = apiHost.trim();
                        if (!isNaN(apiPort)) configPayload.api_port = apiPort;
                        
                        if (Object.keys(configPayload).length > 0) {
                            publish('config', configPayload);
                        }
                    }} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="api_host" className="text-xs font-bold">API Host</Label>
                            <Input 
                                id="api_host"
                                name="api_host"
                                type="text"
                                placeholder="https://example.com"
                                className="font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="api_port" className="text-xs font-bold">API Port</Label>
                            <Input 
                                id="api_port"
                                name="api_port"
                                type="number"
                                placeholder="443"
                                className="font-mono text-sm"
                            />
                        </div>
                        <DialogFooter className="flex gap-2 sm:gap-2">
                            <Button type="submit" variant="outline" disabled={sending} className="flex-1 text-xs font-bold">
                                <Save className="h-3.5 w-3.5 mr-1.5" />
                                Simpan Config
                            </Button>
                            <Button 
                                type="button" 
                                disabled={sending}
                                onClick={() => publish('config', { action: 'test_api' })}
                                className="flex-1 text-xs font-bold bg-purple-600 hover:bg-purple-700"
                            >
                                {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Play className="h-3.5 w-3.5 mr-1.5" />}
                                Test API Upload
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
