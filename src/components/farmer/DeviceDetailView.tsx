'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import DeviceTabs from './DeviceTabs';
import MonitoringPanel from './MonitoringPanel';
import HistoryCard from './HistoryCard';
import DeleteDeviceDialog from './DeleteDeviceDialog';

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

    return (
        <div className={`min-h-screen bg-[#F5F5F5] font-sans ${readonly ? 'w-full' : ''}`}>
            <div className={`${readonly ? 'max-w-4xl' : 'max-w-md'} mx-auto min-h-screen flex flex-col`}>
                {/* Header */}
                <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push(readonly ? '/admin' : '/farmer')}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label={readonly ? "Back to admin" : "Back to devices"}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-2">
                            <Image 
                                src="/assets/images/logos/Logo Growify Tech + Smart Mocaf.png"
                                alt="SmartMocaf"
                                width={140}
                                height={36}
                                className="h-8 w-auto object-contain"
                            />
                        </div>
                    </div>
                    {!readonly && <DeleteDeviceDialog deviceId={device.id} deviceName={device.name} />}
                </header>

                {/* Device Name */}
                <div className="px-6 pt-4 pb-2">
                    <h1 className="text-xl font-semibold text-gray-900">{device.name}</h1>
                    <p className="text-sm text-gray-500">ID: {device.device_code || device.id.slice(0, 8)}</p>
                </div>

                {/* Tabs */}
                <div className="px-6">
                    <DeviceTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </div>

                {/* Content */}
                <main className="flex-1 px-6 pt-4 pb-32">
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
                                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-gray-500">Belum ada riwayat fermentasi.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
