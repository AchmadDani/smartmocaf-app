'use client';

import React, { useState } from 'react';
import { getRunTimeline } from '@/app/actions/device';

interface HistoryItem {
    id: string;
    startedAt: string;
    endedAt: string;
    before: {
        ph: number;
        temp: number;
    };
    after: {
        ph: number;
        temp: number;
    };
}

interface HistoryCardProps {
    item: HistoryItem;
}

export default function HistoryCard({ item }: HistoryCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const startDate = new Date(item.startedAt);
    const endDate = new Date(item.endedAt);

    // Format date: "20 Jan 2025"
    const dateStr = startDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    // Format time: "14:30"
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const startTimeStr = formatTime(startDate);
    const endTimeStr = formatTime(endDate);

    const toggleExpand = async () => {
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);

        if (newExpanded && !loaded && !loading) {
            setLoading(true);
            try {
                const data = await getRunTimeline(item.id);
                setTimeline(data);
                setLoaded(true);
            } catch (error) {
                console.error("Failed to load timeline", error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
            <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={toggleExpand}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="font-medium text-black text-lg">{dateStr}</h4>
                        <p className="text-sm text-gray-500">
                            {startTimeStr} - {endTimeStr}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                            Selesai
                        </div>
                        <svg
                            className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Before (Dimulai) */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Dimulai</p>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">PH</span>
                                <span className="font-semibold text-black">{item.before.ph?.toFixed(1) || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Suhu</span>
                                <span className="font-semibold text-black">{item.before.temp?.toFixed(1) || '-'}°C</span>
                            </div>
                        </div>
                    </div>

                    {/* After (Selesai) */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Selesai</p>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">PH</span>
                                <span className="font-semibold text-black">{item.after.ph?.toFixed(1) || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Suhu</span>
                                <span className="font-semibold text-black">{item.after.temp?.toFixed(1) || '-'}°C</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Dropdown */}
            {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 p-4">
                    <h5 className="font-medium text-black mb-3">Timeline Perubahan PH</h5>

                    {loading ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Memuat data...</div>
                    ) : timeline.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Tidak ada data timeline tersedia.</div>
                    ) : (
                        <div className="relative pl-4 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                            {timeline.map((point, idx) => (
                                <div key={idx} className="relative pl-6">
                                    {/* Dot */}
                                    <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm z-10"></div>

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs text-gray-500 block mb-1">
                                                {formatTime(new Date(point.created_at))}
                                            </span>
                                            <div className="text-sm font-medium text-gray-900">
                                                PH Berubah menjadi {point.ph?.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                                            {point.temp_c?.toFixed(1)}°C
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
