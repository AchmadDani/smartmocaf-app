'use client';

import React, { useState } from 'react';
import { getRunTimeline } from '@/app/actions/device';
import { 
    Calendar, 
    Clock, 
    ChevronRight, 
    ChevronDown, 
    Activity,
    Thermometer,
    Droplets,
    ArrowRight,
    RefreshCw,
    History
} from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
        month: 'long',
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
        <Card className="border-none shadow-sm overflow-hidden bg-white hover:shadow-lg hover:shadow-gray-200/50 transition-all group rounded-[2.5rem]">
            <div
                className="p-8 cursor-pointer"
                onClick={toggleExpand}
            >
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1.5">{dateStr}</h4>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
                                    <Clock className="h-3 w-3" /> {startTimeStr} — {endTimeStr}
                                </span>
                                <Badge variant="secondary" className="text-[9px] font-black tracking-widest px-2.5 py-0.5 h-5 uppercase rounded-lg bg-gray-100/80">
                                    {durationHours}j {durationMinutes}m
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl group-hover:bg-primary/5 transition-colors border border-transparent group-hover:border-primary/10">
                        {isExpanded ? <ChevronDown className="h-5 w-5 text-primary" /> : <ChevronRight className="h-5 w-5 text-gray-300" />}
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-6 relative">
                    {/* Visual Connector */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-white border border-gray-100 z-10 flex items-center justify-center shadow-sm">
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>

                    {/* Awal */}
                    <div className="space-y-4 p-5 rounded-3xl bg-gray-50/50 border border-gray-100/50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">Initial State</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center">
                                        <Droplets className="h-3 w-3 text-blue-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase">pH</span>
                                </div>
                                <span className="text-sm font-black text-gray-900">{item.before.ph?.toFixed(1) || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-md bg-orange-500/10 flex items-center justify-center">
                                        <Thermometer className="h-3 w-3 text-orange-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Suhu</span>
                                </div>
                                <span className="text-sm font-black text-gray-900">{item.before.temp?.toFixed(1) || '-'}°</span>
                            </div>
                        </div>
                    </div>

                    {/* Akhir */}
                    <div className="space-y-4 p-5 rounded-3xl bg-primary/5 border border-primary/10">
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.25em]">Finished Batch</p>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center">
                                        <Droplets className="h-3 w-3 text-primary" />
                                    </div>
                                    <span className="text-[10px] font-black text-primary uppercase">pH</span>
                                </div>
                                <span className="text-sm font-black text-primary">{item.after.ph?.toFixed(1) || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-md bg-gray-900/10 flex items-center justify-center">
                                        <Thermometer className="h-3 w-3 text-gray-900" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase">Suhu</span>
                                </div>
                                <span className="text-sm font-black text-gray-900">{item.after.temp?.toFixed(1) || '-'}°</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Dropdown */}
            {isExpanded && (
                <div className="bg-gray-50/50 border-t border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <History className="h-4 w-4 text-primary" />
                        <h5 className="font-black text-gray-900 text-[10px] tracking-[0.2em] uppercase">Detailed Batch Timeline</h5>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                            </div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Memproses Data...</p>
                        </div>
                    ) : timeline.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tidak ada data detail untuk batch ini.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 relative ml-4">
                            <div className="absolute left-[-11px] top-2 bottom-2 w-px bg-gray-200" />
                            {timeline.map((point, idx) => (
                                <div key={idx} className="relative flex items-center justify-between group/point">
                                    <div className={`absolute left-[-15px] w-2.5 h-2.5 rounded-full bg-white border-2 transition-all z-10 ${point.ph <= 4.5 ? 'border-primary ring-4 ring-primary/5' : 'border-gray-200 group-hover/point:border-gray-400'}`} />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            {formatTime(new Date(point.createdAt))}
                                        </span>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`text-base font-black tracking-tight ${point.ph <= 4.5 ? 'text-primary' : 'text-gray-900'}`}>pH {point.ph?.toFixed(2)}</span>
                                            <div className="w-1 h-1 rounded-full bg-gray-200" />
                                            <span className="text-sm font-bold text-gray-400">{point.tempC?.toFixed(1)}°C</span>
                                        </div>
                                    </div>
                                    
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${point.ph <= 4.5 ? 'bg-primary/10 text-primary shadow-sm' : 'bg-white border border-gray-100 text-gray-200'}`}>
                                        <Activity className="h-4 w-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}

// Help type for the timeline data based on actual model
type TimelinePoint = {
    id: string;
    ph: number;
    tempC: number;
    createdAt: string;
};


