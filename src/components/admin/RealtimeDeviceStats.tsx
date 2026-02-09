'use client';

import React, { useEffect } from 'react';
import { useMqtt } from '@/components/MqttProvider';
import { formatTimeAgo } from '@/utils/date';

interface DeviceData {
    id: string;
    device_code: string;
    temp: number | string;
    ph: number | string;
    waterLevel: number | string;
    is_online: boolean;
}

interface RealtimeDeviceStatsProps {
    initialDevices: any[];
}

export default function RealtimeDeviceStats({ initialDevices }: RealtimeDeviceStatsProps) {
    const { client, lastMessages } = useMqtt();
    const [devices, setDevices] = React.useState(initialDevices);

    useEffect(() => {
        if (!client) return;

        // Subscribe to all device sensor topics
        initialDevices.forEach(device => {
            const topic = `growify/${device.device_code}/sensors`;
            client.subscribe(topic);
        });

        return () => {
            initialDevices.forEach(device => {
                const topic = `growify/${device.device_code}/sensors`;
                client.unsubscribe(topic);
            });
        };
    }, [client, initialDevices]);

    useEffect(() => {
        // Update devices state when a new MQTT message arrived
        const updatedDevices = devices.map(device => {
            const topic = `growify/${device.device_code}/sensors`;
            const liveData = lastMessages[topic];

            if (liveData) {
                return {
                    ...device,
                    temp: liveData.temp ?? device.temp,
                    ph: liveData.ph ?? device.ph,
                    waterLevel: liveData.water_level ?? device.waterLevel,
                    is_online: true, // If we receive a message, it's online
                    lastTelemetry: liveData.datetime || new Date().toISOString(),
                };
            }
            return device;
        });

        // Simple comparison to avoid infinite loops if necessary, but map is fine here
        setDevices(updatedDevices);
    }, [lastMessages]);

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="text-left text-xs font-medium text-gray-500 px-5 py-4">DEVICE</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-5 py-4">STATUS</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-5 py-4">PEMILIK</th>
                        <th className="text-center text-xs font-medium text-gray-500 px-5 py-4">SUHU</th>
                        <th className="text-center text-xs font-medium text-gray-500 px-5 py-4">PH</th>
                        <th className="text-center text-xs font-medium text-gray-500 px-5 py-4">AIR</th>
                        <th className="text-right text-xs font-medium text-gray-500 px-5 py-4">TERAKHIR UPDATE</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {devices.map((device) => (
                        <tr key={device.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-5 py-5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                        device.is_online 
                                            ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                                            : 'bg-gray-300'
                                    }`} />
                                    <div>
                                        <div className="font-semibold text-gray-900 group-hover:text-[#009e3e] transition-colors">
                                            {device.name}
                                        </div>
                                        <p className="text-xs text-gray-400 font-mono mt-0.5 uppercase tracking-wider">{device.device_code || device.id.slice(0, 8)}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-5">
                                <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${device.statusColor}`}>
                                    {device.statusDisplay}
                                </span>
                            </td>
                            <td className="px-5 py-5">
                                {device.ownerName ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-200 uppercase">
                                            {device.ownerName[0]}
                                        </div>
                                        <span className="text-sm font-medium text-gray-600">{device.ownerName}</span>
                                    </div>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        Belum Diklaim
                                    </span>
                                )}
                            </td>
                            <td className="px-5 py-5 text-center">
                                <div className="inline-flex flex-col items-center">
                                    <span className="text-sm font-bold text-orange-600">
                                        {typeof device.temp === 'number' ? `${device.temp.toFixed(1)}°` : device.temp}
                                    </span>
                                </div>
                            </td>
                            <td className="px-5 py-5 text-center">
                                <div className="inline-flex flex-col items-center">
                                    <span className="text-sm font-bold text-blue-600">
                                        {typeof device.ph === 'number' ? device.ph.toFixed(2) : device.ph}
                                    </span>
                                </div>
                            </td>
                            <td className="px-5 py-5 text-center">
                                <div className="inline-flex flex-col items-center">
                                    <span className="text-sm font-bold text-[#009e3e]">
                                        {typeof device.waterLevel === 'number' ? `${device.waterLevel.toFixed(0)}%` : device.waterLevel}
                                    </span>
                                </div>
                            </td>
                            <td className="px-5 py-5 text-right">
                                <span className="text-xs font-medium text-gray-400">
                                    {device.lastTelemetry 
                                        ? formatTimeAgo(device.lastTelemetry) 
                                        : '-'
                                    }
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

