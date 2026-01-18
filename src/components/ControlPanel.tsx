'use client';

import { useState, useTransition } from 'react';
import { updateDeviceSettings } from '@/app/actions/device';

interface ControlPanelProps {
    deviceId: string;
    settings: {
        target_ph: number;
        auto_drain_enabled: boolean;
    };
}

export default function ControlPanel({
    deviceId,
    settings,
}: ControlPanelProps) {
    const [isPending, startTransition] = useTransition();
    const [isEditingPh, setIsEditingPh] = useState(false);
    const [tempPhInput, setTempPhInput] = useState(settings?.target_ph?.toString() || "4.50");

    const handleToggleDrain = () => {
        startTransition(async () => {
            await updateDeviceSettings(deviceId, {
                auto_drain_enabled: !settings.auto_drain_enabled
            });
        });
    };

    const handlePhSubmit = () => {
        const val = parseFloat(tempPhInput);
        if (!isNaN(val)) {
            startTransition(async () => {
                await updateDeviceSettings(deviceId, {
                    target_ph: val
                });
            });
        }
        setIsEditingPh(false);
    };

    // Placeholder toggles for demo (only drain is real in DB as per request "Hubungkan 1 toggle real")
    // But let's act as if they are local state for visual feedback if strictly requested not to bind?
    // User request: "Hubungkan 1 toggle real ke: device_settings.auto_drain_enabled. Toggle lain boleh placeholder"
    const [dummyToggles, setDummyToggles] = useState({ temp: false, ph: false });

    return (
        <div className="space-y-6">
            {/* Hardware Toggles */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-gray-800 font-medium mb-4">Perangkat Keras</h3>
                <div className="space-y-4">
                    <HardwareToggle
                        label="Suhu"
                        icon="thermometer"
                        checked={dummyToggles.temp}
                        onChange={() => setDummyToggles(p => ({ ...p, temp: !p.temp }))}
                        disabled={isPending}
                    />
                    <HardwareToggle
                        label="PH"
                        icon="droplet-ph"
                        checked={dummyToggles.ph}
                        onChange={() => setDummyToggles(p => ({ ...p, ph: !p.ph }))}
                        disabled={isPending}
                    />
                    <HardwareToggle
                        label="Kuras Air (Auto Drain)"
                        icon="pipe"
                        checked={settings.auto_drain_enabled}
                        onChange={handleToggleDrain}
                        disabled={isPending}
                    />
                </div>
            </div>

            {/* Target Process */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-gray-800 font-medium mb-4">Target Proses</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Droplet Icon */}
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.48 0L12 2.69z" /><path d="M16 13a3 3 0 0 1-5.66 0" /><path d="M12 16a2 2 0 0 1 2-2" /></svg>
                        </div>
                        <span className="text-gray-700 font-medium">PH</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditingPh ? (
                            <input
                                type="number"
                                step="0.1"
                                value={tempPhInput}
                                onChange={(e) => setTempPhInput(e.target.value)}
                                onBlur={handlePhSubmit}
                                onKeyDown={(e) => e.key === 'Enter' && handlePhSubmit()}
                                className="w-16 p-1 border rounded text-right font-bold text-gray-800"
                                autoFocus
                            />
                        ) : (
                            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsEditingPh(true)}>
                                <span className="text-xl font-bold text-gray-900">{settings.target_ph}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <button
                className="w-full bg-[#bd7e7e] text-white font-medium py-3 rounded-xl mt-8 hover:bg-[#a66b6b] transition-colors opacity-50 cursor-not-allowed"
                disabled
            >
                Matikan Semua Sensor (Coming Soon)
            </button>
        </div>
    );
}

function HardwareToggle({
    label,
    icon,
    checked,
    onChange,
    disabled
}: {
    label: string;
    icon: string;
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-none flex items-center justify-center text-black">
                    {icon === 'thermometer' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg>
                    )}
                    {icon === 'droplet-ph' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.48 0L12 2.69z" /><path d="M16 13a3 3 0 0 1-5.66 0" /><path d="M12 16a2 2 0 0 1 2-2" /></svg>
                    )}
                    {icon === 'pipe' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h5a3 3 0 0 0 2 8l2-9" /><path d="M3 10v6" /><path d="M7 16h8" /><path d="M21 16h-6" /></svg>
                    )}
                </div>
                <span className="text-gray-700 font-medium">{label}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    disabled={disabled}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#bd7e7e] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#bd7e7e]"></div>
            </label>
        </div>
    );
}
