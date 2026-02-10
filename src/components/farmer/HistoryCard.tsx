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
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 group rounded-[2.5rem]">
            <div
                className="p-8 cursor-pointer active:scale-[0.99] transition-transform"
                onClick={toggleExpand}
            >
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm transition-transform group-hover:scale-110 duration-500">
                            <Calendar className="h-7 w-7" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-2">{dateStr}</h4>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Clock className="h-3 w-3" /> {startTimeStr} — {endTimeStr}
                                </span>
                                <Badge variant="secondary" className="text-[9px] font-black tracking-widest px-2.5 py-0.5 h-5 uppercase rounded-lg bg-gray-100/80 text-gray-500">
                                    {durationHours}j {durationMinutes}m
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-2xl group-hover:bg-primary/5 transition-all border border-transparent group-hover:border-primary/10">
                        {isExpanded ? <ChevronDown className="h-5 w-5 text-primary" /> : <ChevronRight className="h-5 w-5 text-gray-300 group-hover:translate-x-0.5 transition-transform" />}
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-8 relative">
                    {/* Visual Connector */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-white border border-gray-100 z-10 flex items-center justify-center shadow-lg shadow-gray-200/50 transition-transform group-hover:scale-110">
                        <ArrowRight className="h-5 w-5 text-gray-300" />
                    </div>

                    {/* Awal */}
                    <div className="space-y-4 p-6 rounded-[2rem] bg-gray-50/40 border border-gray-100/50">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Mulai</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <Droplets className="h-3 w-3 text-blue-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">pH</span>
                                </div>
                                <span className="text-base font-black text-gray-900">{item.before.ph?.toFixed(1) || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <Thermometer className="h-3 w-3 text-orange-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suhu</span>
                                </div>
                                <span className="text-base font-black text-gray-900">{item.before.temp?.toFixed(1) || '-'}°</span>
                            </div>
                        </div>
                    </div>

                    {/* Akhir */}
                    <div className="space-y-4 p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">Selesai</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
                                        <Droplets className="h-3 w-3 text-primary" />
                                    </div>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">pH</span>
                                </div>
                                <span className="text-base font-black text-primary">{item.after.ph?.toFixed(1) || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-lg bg-gray-900/10 flex items-center justify-center">
                                        <Thermometer className="h-3 w-3 text-gray-900" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Suhu</span>
                                </div>
                                <span className="text-base font-black text-gray-900">{item.after.temp?.toFixed(1) || '-'}°</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Dropdown */}
            {isExpanded && (
                <div className="bg-gray-50/30 border-t border-gray-100/50 p-8 lg:p-10">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                             <History className="h-4 w-4 text-primary" />
                        </div>
                        <h5 className="font-black text-gray-900 text-[10px] tracking-[0.25em] uppercase">Detailed Batch Timeline</h5>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center shadow-lg">
                                <RefreshCw className="h-7 w-7 text-primary animate-spin" />
                            </div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Sinkronisasi Data...</p>
                        </div>
                    ) : timeline.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tidak ada record detail untuk batch ini.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 relative ml-4">
                            <div className="absolute left-[-11px] top-2 bottom-2 w-px bg-gray-200" />
                            {timeline.map((point, idx) => (
                                <div key={idx} className="relative flex items-center justify-between group/point">
                                    <div className={`absolute left-[-17px] w-3.5 h-3.5 rounded-full bg-white border-2 transition-all z-10 shadow-sm ${point.ph <= 4.5 ? 'border-primary ring-4 ring-primary/10' : 'border-gray-200 group-hover/point:border-gray-400'}`} />
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
                                            {formatTime(new Date(point.createdAt))} WIB
                                        </span>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className={`text-xl font-black tracking-tighter ${point.ph <= 4.5 ? 'text-primary' : 'text-gray-900'}`}>
                                                {point.ph?.toFixed(2)} <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 ml-1">pH</span>
                                            </span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                            <span className="text-sm font-black text-gray-400 tracking-tight">{point.tempC?.toFixed(1)}°C</span>
                                        </div>
                                    </div>
                                    
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${point.ph <= 4.5 ? 'bg-primary/10 text-primary shadow-sm shadow-primary/10' : 'bg-white border border-gray-100 text-gray-200'}`}>
                                        <Activity className="h-5 w-5" />
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


