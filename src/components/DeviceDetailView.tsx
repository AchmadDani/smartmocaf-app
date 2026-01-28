'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DeviceTabs from '@/components/DeviceTabs';
import MonitoringPanel from '@/components/MonitoringPanel';

import HistoryCard from '@/components/HistoryCard';

import DeleteDeviceButton from './DeleteDeviceButton';

interface DeviceDetailViewProps {
    device: any;
    settings: any;
    telemetry: any;
    status: 'idle' | 'running' | 'done';
    history: any[];
    readonly?: boolean;
}

export default function DeviceDetailView({ device, settings, telemetry, status, history, readonly = false }: DeviceDetailViewProps) {
    const [activeTab, setActiveTab] = useState<'monitoring' | 'history'>('monitoring');
    const router = useRouter();

    // Desktop check could be done via CSS or hook, 
    // but here we just render broadly. 
    // Admin layout will handle container width.

    return (
        <div className={`min-h-screen bg-gray-50 p-6 font-sans ${readonly ? 'w-full' : ''}`}>
            <div className={`${readonly ? 'max-w-4xl' : 'max-w-md'} mx-auto space-y-6`}>
                {/* Header */}
                <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(readonly ? '/admin' : '/devices')}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label={readonly ? "Back to admin" : "Back to devices"}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <h1 className="text-3xl font-medium text-black">SmartMocaf</h1>
                    </div>

                    {!readonly && <DeleteDeviceButton deviceId={device.id} />}
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
                            settings={settings}
                            readonly={readonly}
                        />
                    ) : (
                        <div className="space-y-4">
                            {history && history.length > 0 ? (
                                history.map((item) => (
                                    <HistoryCard key={item.id} item={item} />
                                ))
                            ) : (
                                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                                    <p className="text-gray-500">Belum ada riwayat fermentasi.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
