'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DeviceTabs from '@/components/DeviceTabs';
import MonitoringPanel from '@/components/MonitoringPanel';
import ControlPanel from '@/components/ControlPanel';

export default function DeviceDetailPage() {
    const router = useRouter();
    const params = useParams(); // params.deviceId

    // State
    const [activeTab, setActiveTab] = useState<'monitoring' | 'control'>('monitoring');

    // Dummy Sensor Data
    const [temperature, setTemperature] = useState(28);
    const [ph, setPh] = useState(4.5);
    const [fermentationStatus, setFermentationStatus] = useState<'IDLE' | 'RUNNING' | 'DONE'>('IDLE');

    // Control State
    const [toggles, setToggles] = useState({
        tempEnabled: false,
        phEnabled: false,
        drainEnabled: false,
    });
    const [targetPh, setTargetPh] = useState(4.5);

    const handleStartFermentation = () => {
        // Dummy logic: just switch state to RUNNING
        setFermentationStatus('RUNNING');

        // Simulate completion after 5 seconds for demo
        setTimeout(() => {
            setFermentationStatus('DONE');
        }, 5000);
    };

    const handleToggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleTurnOffAll = () => {
        setToggles({
            tempEnabled: false,
            phEnabled: false,
            drainEnabled: false,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-md mx-auto space-y-6">
                {/* Header & Back */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">SmartMocaf</h1>
                </div>

                {/* Tabs */}
                <DeviceTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Content */}
                <div className="mt-6">
                    {activeTab === 'monitoring' ? (
                        <MonitoringPanel
                            temperature={temperature}
                            ph={ph}
                            fermentationStatus={fermentationStatus}
                            onStartFermentation={handleStartFermentation}
                        />
                    ) : (
                        <ControlPanel
                            toggles={toggles}
                            targetPh={targetPh}
                            onToggle={handleToggle}
                            onTargetPhChange={setTargetPh}
                            onTurnOffAll={handleTurnOffAll}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
