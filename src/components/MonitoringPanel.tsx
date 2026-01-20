'use client';

import { startFermentation, stopFermentation, simulateTelemetry, updateDeviceSettings } from "@/app/actions/device";
import { useTransition, useState, FormEvent } from "react";

interface MonitoringPanelProps {
    deviceId: string;
    telemetry: { ph: number; temp_c: number } | null;
    status: 'idle' | 'running' | 'done';
    settings: {
        target_ph: number;
        auto_drain_enabled: boolean;
    };
}

export default function MonitoringPanel({ deviceId, telemetry, status, settings }: MonitoringPanelProps) {
    const [isPending, startTransition] = useTransition();
    const [showPhModal, setShowPhModal] = useState(false);
    const [tempPhInput, setTempPhInput] = useState("");

    const handleStart = () => {
        startTransition(async () => {
            await startFermentation(deviceId);
        });
    };

    const handleStop = () => {
        startTransition(async () => {
            await stopFermentation(deviceId);
            // Automatically open drain when finished
            await updateDeviceSettings(deviceId, {
                auto_drain_enabled: true
            });
        });
    };

    const handleSimulate = () => {
        startTransition(async () => {
            await simulateTelemetry(deviceId);
        });
    };

    const handleToggleDrain = () => {
        startTransition(async () => {
            await updateDeviceSettings(deviceId, {
                auto_drain_enabled: !settings.auto_drain_enabled
            });
        });
    };

    const handleOpenPhModal = () => {
        setTempPhInput(settings?.target_ph?.toString() || "4.50");
        setShowPhModal(true);
    };

    const handlePhSubmit = (formData: FormData) => {
        const val = parseFloat(formData.get('ph') as string);
        if (!isNaN(val)) {
            startTransition(async () => {
                await updateDeviceSettings(deviceId, {
                    target_ph: val
                });
            });
        }
        setShowPhModal(false);
    };

    // Determine current step index for the timeline
    const activeStep = status === 'idle' ? 0 : status === 'running' ? 1 : 2;

    const steps = [
        { label: 'Belum di Mulai', value: 0 },
        { label: 'Sedang Berlangsung', value: 1 },
        { label: 'Selesai', value: 2 }
    ];

    return (
        <div className="space-y-6">
            {/* Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Temperature Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col h-32 justify-between">
                    <div className="flex items-center gap-2 text-black">
                        {/* Thermometer Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg>
                        <span className="font-medium text-sm">Suhu</span>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-black group flex items-baseline gap-1">
                            {telemetry?.temp_c != null ? telemetry.temp_c : '--'} <span className="text-sm font-bold">C</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Derajat</div>
                    </div>
                </div>

                {/* pH Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col h-32 justify-between">
                    <div className="flex items-center gap-2 text-black">
                        {/* Drop/Water Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.48 0L12 2.69z" /><path d="M16 13a3 3 0 0 1-5.66 0" /><path d="M12 16a2 2 0 0 1 2-2" /></svg>
                        <span className="font-medium text-sm">PH</span>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-black">
                            {telemetry?.ph != null ? telemetry.ph : '--'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Asam</div>
                    </div>
                </div>
            </div>

            {/* Hardware Section (Perangkat Keras) */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-black font-medium mb-4">Perangkat Keras</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">
                            {/* Pipe/Tap Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h5a3 3 0 0 0 2 8l2-9" /><path d="M3 10v6" /><path d="M7 16h8" /><path d="M21 16h-6" /></svg>
                        </div>
                        <span className="text-gray-700 font-medium">Buka Keran</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.auto_drain_enabled}
                            onChange={() => {
                                // If running, we don't proceed (onClick handles the alert)
                                if (status === 'running') return;

                                handleToggleDrain();
                            }}
                            onClick={(e) => {
                                if (status === 'running') {
                                    e.preventDefault();
                                    alert("Toggle dimatikan karena sedang berada pada proses fermentasi");
                                }
                            }}
                            disabled={isPending}
                            className="sr-only peer"
                        />
                        <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#bd7e7e] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black ${status === 'running' ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                    </label>
                </div>
            </div>

            {/* Target Process Section */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-black font-medium mb-4">Target Proses</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-black">
                            {/* Droplet with H2O Icon or similar */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.48 0L12 2.69z" /><path d="M12 12v4" /><path d="M10 16h4" /><circle cx="12" cy="14" r="6" stroke="currentColor" strokeWidth="1.5" /></svg>
                        </div>
                        <span className="text-gray-900 font-medium text-lg">PH</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={handleOpenPhModal}>
                            <span className="text-xl font-bold text-black">{settings.target_ph}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Fermentasi Timeline */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-medium text-gray-900 mb-6">Status Fermentasi</h3>
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-black"></div>

                    <div className="space-y-8">
                        {steps.map((step, index) => {
                            const isActive = index === activeStep;

                            return (
                                <div key={step.value} className="relative flex items-center gap-4">
                                    {/* Dot */}
                                    <div className={`z-10 w-4 h-4 rounded-full border-2 ${isActive ? 'bg-[#bd7e7e] border-[#bd7e7e]' : 'bg-black border-black'}`}></div>
                                    <span className={`text-sm ${isActive ? 'text-[#bd7e7e]' : 'text-black'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Button */}
            <div className="fixed bottom-6 left-0 right-0 px-6 max-w-md mx-auto z-10">
                {status === 'running' ? (
                    <button
                        onClick={handleStop}
                        disabled={isPending}
                        className="w-full bg-[#bd7e7e] text-white font-medium py-4 rounded-xl hover:bg-[#a66b6b] transition-colors shadow-lg disabled:opacity-50"
                    >
                        {isPending ? 'Processing...' : 'Selesai Fermentasi'}
                    </button>
                ) : (
                    <button
                        onClick={handleStart}
                        disabled={isPending}
                        className="w-full bg-[#bd7e7e] text-white font-medium py-4 rounded-xl hover:bg-[#a66b6b] transition-colors shadow-lg disabled:opacity-50"
                    >
                        {isPending ? 'Processing...' : 'Mulai Fermentasi'}
                    </button>
                )}
            </div>

            {/* Spacer to prevent button from covering content */}
            <div className="h-24"></div>

            {/* Dev Tool */}
            <div className="text-center">
                <button
                    onClick={handleSimulate}
                    disabled={isPending}
                    className="text-xs text-gray-300 hover:text-gray-500"
                >
                    [Dev] Simulate Telemetry
                </button>
            </div>

            {/* pH Edit Modal */}
            {showPhModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm relative">
                        <h3 className="text-sm font-normal text-black mb-2">Target PH</h3>

                        <form action={handlePhSubmit}>
                            <input
                                name="ph"
                                type="number"
                                step="0.1"
                                defaultValue={tempPhInput}
                                required
                                autoFocus
                                className="w-full border border-gray-400 rounded-lg p-2.5 text-black outline-none focus:border-black mb-6"
                            />

                            <button
                                type="submit"
                                className="w-full py-3 bg-[#C08080] text-white font-normal rounded-lg hover:bg-[#A06060] transition-colors"
                            >
                                Simpan
                            </button>
                        </form>
                    </div>
                    <div className="absolute inset-0 -z-10" onClick={() => setShowPhModal(false)} />
                </div>
            )}
        </div>
    );
}
