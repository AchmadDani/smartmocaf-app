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

    const dateStr = startDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const startTimeStr = formatTime(startDate);
    const endTimeStr = formatTime(endDate);

    // Calculate duration
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={toggleExpand}
            >
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h4 className="font-semibold text-gray-900">{dateStr}</h4>
                        <p className="text-sm text-gray-500">
                            {startTimeStr} - {endTimeStr}
                            <span className="ml-2 text-gray-400">({durationHours}j {durationMinutes}m)</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-[#009e3e]/10 text-[#009e3e] text-xs px-2.5 py-1 rounded-full font-medium">
                            Selesai
                        </span>
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

                <div className="grid grid-cols-2 gap-3">
                    {/* Before */}
                    <div className="bg-gray-50 p-3 rounded-xl">
                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Awal</p>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">pH</span>
                                <span className="font-semibold text-gray-900">{item.before.ph?.toFixed(1) || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Suhu</span>
                                <span className="font-semibold text-gray-900">{item.before.temp?.toFixed(1) || '-'}°C</span>
                            </div>
                        </div>
                    </div>

                    {/* After */}
                    <div className="bg-[#009e3e]/5 p-3 rounded-xl">
                        <p className="text-xs text-[#009e3e] mb-2 font-medium uppercase tracking-wide">Akhir</p>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">pH</span>
                                <span className="font-semibold text-[#009e3e]">{item.after.ph?.toFixed(1) || '-'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Suhu</span>
                                <span className="font-semibold text-gray-900">{item.after.temp?.toFixed(1) || '-'}°C</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Dropdown */}
            {isExpanded && (
                <div className="bg-gray-50 border-t border-gray-100 p-4">
                    <h5 className="font-medium text-gray-900 mb-3 text-sm">Timeline Perubahan pH</h5>

                    {loading ? (
                        <div className="text-center py-4 text-gray-500 text-sm">
                            <svg className="animate-spin w-5 h-5 mx-auto mb-2 text-[#009e3e]" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Memuat data...
                        </div>
                    ) : timeline.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm">Tidak ada data timeline tersedia.</div>
                    ) : (
                        <div className="relative pl-4 space-y-4">
                            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                            {timeline.map((point, idx) => (
                                <div key={idx} className="relative pl-5">
                                    <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-[#009e3e] border-2 border-white shadow-sm z-10"></div>

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs text-gray-500 block mb-0.5">
                                                {formatTime(new Date(point.created_at))}
                                            </span>
                                            <div className="text-sm font-medium text-gray-900">
                                                pH: {point.ph?.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-100">
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
