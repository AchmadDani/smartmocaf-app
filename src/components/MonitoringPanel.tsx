'use client';

import { startFermentation, stopFermentation, simulateTelemetry } from "@/app/actions/device";
import { useTransition } from "react";

interface MonitoringPanelProps {
    deviceId: string;
    telemetry: { ph: number; temp_c: number } | null;
    status: 'idle' | 'running' | 'done';
}

export default function MonitoringPanel({ deviceId, telemetry, status }: MonitoringPanelProps) {
    const [isPending, startTransition] = useTransition();

    const handleStart = () => {
        startTransition(async () => {
            await startFermentation(deviceId);
        });
    };

    const handleStop = () => {
        startTransition(async () => {
            await stopFermentation(deviceId);
        });
    };

    const handleSimulate = () => {
        startTransition(async () => {
            await simulateTelemetry(deviceId);
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-orange-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg>
                            <span className="font-medium text-sm">Suhu</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {telemetry?.temp_c != null ? telemetry.temp_c : '--'} <span className="text-sm font-normal text-gray-500">°C</span>
                        </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2 text-blue-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.48 0L12 2.69z" /><path d="M16 13a3 3 0 0 1-5.66 0" /><path d="M12 16a2 2 0 0 1 2-2" /></svg>
                            <span className="font-medium text-sm">pH</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                            {telemetry?.ph != null ? telemetry.ph : '--'}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 text-sm font-medium">Status Fermentasi</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status === 'running' ? 'bg-green-100 text-green-700' :
                                status === 'done' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {status === 'running' ? 'Running' : status === 'done' ? 'Selesai' : 'Idle'}
                        </span>
                    </div>

                    {status === 'running' ? (
                        <button
                            onClick={handleStop}
                            disabled={isPending}
                            className="w-full bg-red-600 text-white font-medium py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isPending ? 'Processing...' : 'Selesai Fermentasi'}
                        </button>
                    ) : (
                        <button
                            onClick={handleStart}
                            disabled={isPending}
                            className="w-full bg-[#bd7e7e] text-white font-medium py-3 rounded-lg hover:bg-[#a66b6b] transition-colors shadow-custom hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            {isPending ? 'Processing...' : 'Mulai Fermentasi'}
                        </button>
                    )}
                </div>
            </div>

            {/* Dev Tool */}
            <button
                onClick={handleSimulate}
                disabled={isPending}
                className="w-full text-xs text-gray-400 hover:text-gray-600 underline"
            >
                [Dev] Simulate Telemetry
            </button>
        </div>
    );
}
