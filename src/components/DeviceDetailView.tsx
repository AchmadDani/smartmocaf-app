'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DeviceTabs from '@/components/DeviceTabs';
import MonitoringPanel from '@/components/MonitoringPanel';
import ControlPanel from '@/components/ControlPanel';

interface DeviceDetailViewProps {
    device: any;
    settings: any;
    telemetry: any;
    status: 'idle' | 'running' | 'done';
}

export default function DeviceDetailView({ device, settings, telemetry, status }: DeviceDetailViewProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'monitoring' | 'control'>('monitoring');

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans">
            <div className="max-w-md mx-auto space-y-6">
                {/* Header & Back */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{device.name}</h1>
                </div>

                {/* Tabs */}
                <DeviceTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Content */}
                <div className="mt-6">
                    {activeTab === 'monitoring' ? (
                        <MonitoringPanel
                            deviceId={device.id}
                            telemetry={telemetry}
                            status={status}
                        />
                    ) : (
                        <ControlPanel
                            deviceId={device.id}
                            settings={settings}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
