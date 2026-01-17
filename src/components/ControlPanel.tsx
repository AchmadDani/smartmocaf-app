'use client';

import { useState } from 'react';

interface ControlPanelProps {
    toggles: {
        tempEnabled: boolean;
        phEnabled: boolean;
        drainEnabled: boolean;
    };
    targetPh: number;
    onToggle: (key: 'tempEnabled' | 'phEnabled' | 'drainEnabled') => void;
    onTargetPhChange: (val: number) => void;
    onTurnOffAll: () => void;
}

export default function ControlPanel({
    toggles,
    targetPh,
    onToggle,
    onTargetPhChange,
    onTurnOffAll,
}: ControlPanelProps) {
    const [isEditingPh, setIsEditingPh] = useState(false);
    const [tempPhInput, setTempPhInput] = useState(targetPh.toString());

    const handlePhSubmit = () => {
        const val = parseFloat(tempPhInput);
        if (!isNaN(val)) {
            onTargetPhChange(val);
        }
        setIsEditingPh(false);
    };

    return (
        <div className="space-y-6">
            {/* Hardware Toggles */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="text-gray-800 font-medium mb-4">Perangkat Keras</h3>
                <div className="space-y-4">
                    <HardwareToggle
                        label="Suhu"
                        icon="thermometer"
                        checked={toggles.tempEnabled}
                        onChange={() => onToggle('tempEnabled')}
                    />
                    <HardwareToggle
                        label="PH"
                        icon="droplet-ph"
                        checked={toggles.phEnabled}
                        onChange={() => onToggle('phEnabled')}
                    />
                    <HardwareToggle
                        label="Kuras Air"
                        icon="pipe"
                        checked={toggles.drainEnabled}
                        onChange={() => onToggle('drainEnabled')}
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
                                <span className="text-xl font-bold text-gray-900">{targetPh}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={onTurnOffAll}
                className="w-full bg-[#bd7e7e] text-white font-medium py-3 rounded-xl mt-8 hover:bg-[#a66b6b] transition-colors"
            >
                Matikan Semua Sensor
            </button>
        </div>
    );
}

function HardwareToggle({
    label,
    icon,
    checked,
    onChange,
}: {
    label: string;
    icon: string;
    checked: boolean;
    onChange: () => void;
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10h5a3 3 0 0 0 2 8l2-9" /><path d="M3 10v6" /><path d="M7 16h8" /><path d="M21 16h-6" /></svg> // Approximation
                    )}
                </div>
                <span className="text-gray-700 font-medium">{label}</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={onChange}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#bd7e7e] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#bd7e7e]"></div>
            </label>
        </div>
    );
}
