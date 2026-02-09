'use client';

import { startFermentation, stopFermentation, simulateTelemetry, updateDeviceSettings, manualDrainToggle } from "@/app/actions/device";
import { useTransition, useState, useEffect } from "react";
import { showConfirm, showSuccess, showError, showLoading, closeSwal } from "@/lib/swal";
import { useMqtt } from "@/components/MqttProvider";

interface MonitoringPanelProps {
    deviceId: string;
    telemetry: { ph: number; temp_c: number; water_level?: number } | null;
    status: 'idle' | 'running' | 'done';
    settings: {
        target_ph: number;
        auto_drain_enabled: boolean;
    };
    mode?: 'auto' | 'manual';
    isOnline?: boolean;
    readonly?: boolean;
}

export default function MonitoringPanel({ deviceId, telemetry: initialTelemetry, status, settings, mode: initialMode = 'auto', isOnline: initialOnline = false, readonly = false }: MonitoringPanelProps) {
    const { client, lastMessages } = useMqtt();
    const [isPending, startTransition] = useTransition();
    const [showPhModal, setShowPhModal] = useState(false);
    const [tempPhInput, setTempPhInput] = useState("");
    
    // Local state for real-time telemetry
    const [liveTelemetry, setLiveTelemetry] = useState(initialTelemetry);
    const [liveMode, setLiveMode] = useState(initialMode);
    const [isDeviceOnline, setIsDeviceOnline] = useState(initialOnline);

    useEffect(() => {
        if (!client || !deviceId) return;

        // Find device code if possible, or use ID (firmware uses device ID)
        // For now we assume deviceId is what's used in topics
        const topic = `growify/${deviceId}/sensors`;
        client.subscribe(topic);

        return () => {
            client.unsubscribe(topic);
        };
    }, [client, deviceId]);

    useEffect(() => {
        const topic = `growify/${deviceId}/sensors`;
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
    }, [lastMessages, deviceId]);

    const handleStart = async () => {
        const result = await showConfirm(
            'Mulai Fermentasi?',
            'Proses fermentasi akan dimulai. Pastikan singkong sudah siap dalam tangki.',
            'Ya, Mulai'
        );
        
        if (result.isConfirmed) {
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

    const handleSimulate = () => {
        startTransition(async () => {
            await simulateTelemetry(deviceId);
        });
    };

    const handleToggleDrain = async () => {
        const isOpening = !settings.auto_drain_enabled;
        const result = await showConfirm(
            isOpening ? 'Buka Keran?' : 'Tutup Keran?',
            isOpening 
                ? 'Air dalam tangki akan dikeluarkan.' 
                : 'Keran akan ditutup.',
            isOpening ? 'Ya, Buka' : 'Ya, Tutup'
        );
        
        if (result.isConfirmed) {
            startTransition(async () => {
                try {
                    await manualDrainToggle(deviceId, isOpening);
                    showSuccess(
                        isOpening ? 'Keran Dibuka' : 'Keran Ditutup',
                        isOpening ? 'Air sedang dikeluarkan.' : 'Keran telah ditutup.'
                    );
                } catch (error) {
                    showError('Gagal', 'Terjadi kesalahan.');
                }
            });
        }
    };

    const handleOpenPhModal = () => {
        setTempPhInput(settings?.target_ph?.toString() || "4.50");
        setShowPhModal(true);
    };

    const handlePhSubmit = (formData: FormData) => {
        const val = parseFloat(formData.get('ph') as string);
        if (!isNaN(val)) {
            startTransition(async () => {
                try {
                    await updateDeviceSettings(deviceId, { target_ph: val });
                    showSuccess('Target pH Diperbarui', `Target pH: ${val}`);
                } catch (error) {
                    showError('Gagal', 'Tidak dapat memperbarui target pH.');
                }
            });
        }
        setShowPhModal(false);
    };

    const activeStep = status === 'idle' ? 0 : status === 'running' ? 1 : 2;

    const steps = [
        { label: 'Belum Dimulai', value: 0 },
        { label: 'Sedang Berlangsung', value: 1 },
        { label: 'Selesai', value: 2 }
    ];

    return (
        <div className="space-y-4">
            {/* Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Temperature Card */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                        </svg>
                        <span className="text-sm font-medium">Suhu</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        {liveTelemetry?.temp_c != null ? liveTelemetry.temp_c : '--'}
                        <span className="text-lg font-semibold text-gray-400">°C</span>
                    </div>
                </div>

                {/* pH Card */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.48 0L12 2.69z" />
                        </svg>
                        <span className="text-sm font-medium">pH Level</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        {liveTelemetry?.ph != null ? liveTelemetry.ph : '--'}
                    </div>
                </div>

                {/* Water Level Card */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.48 0L12 2.69z" />
                        </svg>
                        <span className="text-sm font-medium">Level Air</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                        {liveTelemetry?.water_level != null ? liveTelemetry.water_level : '--'}
                        <span className="text-lg font-semibold text-gray-400">%</span>
                    </div>
                </div>

                {/* Target pH Card */}
                <div 
                    className={`bg-white p-4 rounded-2xl shadow-sm border border-gray-100 ${!readonly ? 'cursor-pointer hover:border-[#009e3e] transition-colors' : ''}`}
                    onClick={readonly ? undefined : handleOpenPhModal}
                >
                    <div className="flex items-center justify-between text-gray-500 mb-3">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 2v2m0 16v2M2 12h2m16 0h2" />
                            </svg>
                            <span className="text-sm font-medium">Target pH</span>
                        </div>
                        {!readonly && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                            </svg>
                        )}
                    </div>
                    <div className="text-3xl font-bold text-[#009e3e]">
                        {settings.target_ph}
                    </div>
                </div>
            </div>

            {/* Hardware Section */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Perangkat Keras</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.48 0L12 2.69z" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-gray-900 font-medium">Keran Air</span>
                            <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500">{settings.auto_drain_enabled ? 'Terbuka' : 'Tertutup'}</p>
                                <span className="text-[10px] text-gray-300">•</span>
                                <span className={`text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 rounded uppercase tracking-wider ${liveMode === 'manual' ? 'bg-orange-50 text-orange-600' : ''}`}>{liveMode}</span>
                            </div>
                        </div>
                    </div>
                    {readonly ? (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${settings.auto_drain_enabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {settings.auto_drain_enabled ? 'Terbuka' : 'Tertutup'}
                        </span>
                    ) : (
                        <button
                            onClick={handleToggleDrain}
                            disabled={isPending}
                            className={`relative w-12 h-7 rounded-full transition-colors ${settings.auto_drain_enabled ? 'bg-[#009e3e]' : 'bg-gray-200'} ${isPending ? 'opacity-50' : ''}`}
                        >
                            <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.auto_drain_enabled ? 'left-6' : 'left-1'}`}></span>
                        </button>
                    )}
                </div>
            </div>

            {/* Status Fermentasi */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Status Fermentasi</h3>
                <div className="relative pl-6">
                    {/* Vertical Line */}
                    <div className="absolute left-[7px] top-1 bottom-1 w-0.5 bg-gray-200"></div>

                    <div className="space-y-6">
                        {steps.map((step, index) => {
                            const isActive = index === activeStep;
                            const isPassed = index < activeStep;

                            return (
                                <div key={step.value} className="relative flex items-center gap-3">
                                    <div className={`absolute -left-6 z-10 w-4 h-4 rounded-full border-2 ${
                                        isActive 
                                            ? 'bg-[#009e3e] border-[#009e3e]' 
                                            : isPassed 
                                                ? 'bg-[#009e3e] border-[#009e3e]'
                                                : 'bg-white border-gray-300'
                                    }`}>
                                        {isPassed && (
                                            <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`text-sm ${isActive ? 'text-[#009e3e] font-semibold' : 'text-gray-500'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Button */}
            {!readonly && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#F5F5F5] via-[#F5F5F5] to-transparent">
                    <div className="max-w-md mx-auto">
                        {status === 'running' ? (
                            <button
                                onClick={handleStop}
                                disabled={isPending}
                                className="w-full bg-orange-500 text-white font-semibold py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
                            >
                                {isPending ? 'Memproses...' : 'Selesaikan Fermentasi'}
                            </button>
                        ) : (
                            <button
                                onClick={handleStart}
                                disabled={isPending}
                                className="w-full bg-[#009e3e] text-white font-semibold py-4 rounded-2xl hover:bg-[#007d31] transition-all shadow-lg shadow-[#009e3e]/20 disabled:opacity-50"
                            >
                                {isPending ? 'Memproses...' : 'Mulai Fermentasi'}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Dev Tool */}
            {process.env.NODE_ENV !== 'production' && (
                <div className="text-center pt-4">
                    <button
                        onClick={handleSimulate}
                        disabled={isPending}
                        className="text-xs text-gray-300 hover:text-gray-500"
                    >
                        [Dev] Simulate Telemetry
                    </button>
                </div>
            )}

            {/* pH Edit Modal */}
            {showPhModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubah Target pH</h3>

                        <form action={handlePhSubmit}>
                            <input
                                name="ph"
                                type="number"
                                step="0.1"
                                min="3"
                                max="7"
                                defaultValue={tempPhInput}
                                required
                                autoFocus
                                className="w-full border border-gray-200 rounded-xl p-3 text-gray-900 text-lg font-semibold outline-none focus:border-[#009e3e] focus:ring-2 focus:ring-[#009e3e]/10 mb-4"
                            />

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPhModal(false)}
                                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-[#009e3e] text-white font-medium rounded-xl hover:bg-[#007d31] transition-colors"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
