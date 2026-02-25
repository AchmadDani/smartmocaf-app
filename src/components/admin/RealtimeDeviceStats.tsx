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
    temp_device?: number;
    distance_cm?: number;
    mode?: string;
    relay?: number;
    status?: string;
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
        setDevices(prev => prev.map(device => {
            const topic = `growify/${device.device_code}/sensors`;
            const liveData = lastMessages[topic];

            if (liveData) {
                return {
                    ...device,
                    temp: liveData.temp ?? device.temp,
                    ph: liveData.ph ?? device.ph,
                    waterLevel: liveData.water_level ?? device.waterLevel,
                    temp_device: liveData.temp_device ?? device.temp_device,
                    distance_cm: liveData.distance_cm ?? device.distance_cm,
                    mode: liveData.mode ?? device.mode,
                    relay: liveData.relay ?? device.relay,
                    status: liveData.status ?? device.status,
                    is_online: true,
                    lastTelemetry: liveData.datetime || new Date().toISOString(),
                };
            }
            return device;
        }));
    }, [lastMessages]);

    const modeColors: Record<string, string> = {
        auto: 'bg-green-100 text-green-700',
        manual: 'bg-amber-100 text-amber-700',
        test: 'bg-purple-100 text-purple-700',
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-4">DEVICE</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-4">STATUS</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-4">PEMILIK</th>
                        <th className="text-center text-xs font-medium text-gray-500 px-3 py-4">SUHU</th>
                        <th className="text-center text-xs font-medium text-gray-500 px-3 py-4">PH</th>
                        <th className="text-center text-xs font-medium text-gray-500 px-3 py-4">AIR %</th>
                        <th className="text-center text-xs font-medium text-gray-500 px-3 py-4">JARAK</th>
                        <th className="text-center text-xs font-medium text-gray-500 px-3 py-4">ESP32</th>
                        <th className="text-center text-xs font-medium text-gray-500 px-3 py-4">MODE</th>
                        <th className="text-center text-xs font-medium text-gray-500 px-3 py-4">RELAY</th>
                        <th className="text-right text-xs font-medium text-gray-500 px-4 py-4">UPDATE</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {devices.map((device) => (
                        <tr key={device.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                        device.is_online 
                                            ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                                            : 'bg-gray-300'
                                    }`} />
                                    <div>
                                        <div className="font-semibold text-gray-900 group-hover:text-[#009e3e] transition-colors text-sm">
                                            {device.name}
                                        </div>
                                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">{device.device_code || device.id.slice(0, 8)}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${device.statusColor}`}>
                                    {device.statusDisplay}
                                </span>
                            </td>
                            <td className="px-4 py-4">
                                {device.ownerName ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-500 border border-gray-200 uppercase">
                                            {device.ownerName[0]}
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">{device.ownerName}</span>
                                    </div>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-800">
                                        Belum Diklaim
                                    </span>
                                )}
                            </td>
                            <td className="px-3 py-4 text-center">
                                <span className="text-sm font-bold text-orange-600">
                                    {typeof device.temp === 'number' ? `${device.temp.toFixed(1)}°` : device.temp || '--'}
                                </span>
                            </td>
                            <td className="px-3 py-4 text-center">
                                <span className="text-sm font-bold text-blue-600">
                                    {typeof device.ph === 'number' ? device.ph.toFixed(2) : device.ph || '--'}
                                </span>
                            </td>
                            <td className="px-3 py-4 text-center">
                                <span className="text-sm font-bold text-[#009e3e]">
                                    {typeof device.waterLevel === 'number' ? `${device.waterLevel.toFixed(0)}%` : device.waterLevel || '--'}
                                </span>
                            </td>
                            <td className="px-3 py-4 text-center">
                                <span className="text-sm font-bold text-gray-600">
                                    {device.distance_cm != null ? `${Number(device.distance_cm).toFixed(1)} cm` : '--'}
                                </span>
                            </td>
                            <td className="px-3 py-4 text-center">
                                <span className="text-xs font-bold text-red-500">
                                    {device.temp_device != null ? `${Number(device.temp_device).toFixed(1)}°` : '--'}
                                </span>
                            </td>
                            <td className="px-3 py-4 text-center">
                                {device.mode ? (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${modeColors[device.mode] || 'bg-gray-100 text-gray-600'}`}>
                                        {device.mode}
                                    </span>
                                ) : <span className="text-gray-300">--</span>}
                            </td>
                            <td className="px-3 py-4 text-center">
                                <span className={`inline-flex w-6 h-6 rounded-lg items-center justify-center text-[10px] font-black ${device.relay === 1 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {device.relay === 1 ? 'ON' : 'OF'}
                                </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                                <span className="text-[10px] font-medium text-gray-400">
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
