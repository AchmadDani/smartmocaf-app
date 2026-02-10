'use client';

import Link from 'next/link';
import { 
    Thermometer, 
    Droplets, 
    Waves, 
    ChevronRight, 
    Cpu,
    ArrowUpRight
} from 'lucide-react';

interface DeviceCardProps {
    id: string;
    name: string;
    deviceCode?: string;
    statusDisplay: string;
    statusColor: string;
    temp: number | string;
    ph: number | string;
    waterLevel?: number | string;
    isOnline?: boolean;
    href: string;
}

export default function DeviceCard({
    id,
    name,
    deviceCode,
    statusDisplay,
    statusColor,
    temp,
    ph,
    waterLevel,
    isOnline = false,
    href
}: DeviceCardProps) {
    return (
        <Link href={href} className="block group">
            <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-gray-100/80 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                {/* Header */}
                <div className="flex items-center justify-between mb-8 relative">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                                isOnline ? 'bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50' : 'bg-gray-100 text-gray-400'
                            }`}>
                                <Cpu className="h-7 w-7" />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 group-hover:text-primary transition-colors leading-tight text-xl tracking-tight">{name}</h3>
                            {deviceCode && (
                                <p className="text-[10px] font-mono text-gray-400 font-bold tracking-[0.2em] uppercase mt-1">{deviceCode}</p>
                            )}
                        </div>
                    </div>
                    <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-0 shadow-sm transition-all group-hover:shadow-md ${statusColor}`}>
                        {statusDisplay}
                    </span>
                </div>

                {/* Sensor Data Bento Grid */}
                <div className="grid grid-cols-2 gap-4 relative">
                    <div className="bg-gradient-to-br from-orange-50/40 to-amber-50/40 p-5 rounded-[1.75rem] border border-orange-100/30 group-hover:border-orange-200 transition-colors">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <Thermometer className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="text-[10px] font-black text-orange-600/70 uppercase tracking-widest">Suhu</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-gray-900 leading-none">
                                {typeof temp === 'number' ? temp.toFixed(1) : temp}
                            </span>
                            <span className="text-xs font-black text-gray-400 uppercase">°C</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50/40 to-indigo-50/40 p-5 rounded-[1.75rem] border border-blue-100/30 group-hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Droplets className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-[10px] font-black text-blue-600/70 uppercase tracking-widest">Keasaman</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black text-gray-900 leading-none">
                                {typeof ph === 'number' ? ph.toFixed(2) : ph}
                            </span>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-tight">pH</span>
                        </div>
                    </div>

                    <div className="col-span-2 bg-gradient-to-r from-emerald-50/40 to-primary/5 p-5 rounded-[1.75rem] border border-primary/10 group-hover:border-primary/20 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Waves className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">Level Air</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-gray-900 leading-none">
                                        {typeof waterLevel === 'number' ? waterLevel : waterLevel || '--'}
                                    </span>
                                    <span className="text-[10px] font-black text-primary uppercase">% Kapasitas</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-24 h-2 bg-gray-100/50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                            <div 
                                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000 shadow-sm" 
                                style={{ width: `${typeof waterLevel === 'number' ? waterLevel : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between relative group/btn">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-gray-300'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isOnline ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {isOnline ? 'Sistem Terkoneksi' : 'Koneksi Terputus'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-30 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500 ease-out">
                        Lihat Monitoring 
                        <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

