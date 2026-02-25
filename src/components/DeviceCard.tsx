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
            <div className="bg-white rounded-2xl md:rounded-[2.5rem] p-5 md:p-7 shadow-sm border border-gray-100/80 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-500 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 group-hover:scale-150 transition-transform duration-700" />

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8 relative">
                    <div className="flex items-center gap-3 md:gap-5">
                        <div className="relative">
                            <div className={`w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm ${
                                isOnline ? 'bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/50' : 'bg-gray-100 text-gray-400'
                            }`}>
                                <Cpu className="h-5 w-5 md:h-7 md:w-7" />
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 md:w-4 h-3 md:h-4 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 group-hover:text-primary transition-colors leading-tight text-base md:text-xl tracking-tight">{name}</h3>
                            {deviceCode && (
                                <p className="text-[9px] md:text-[10px] font-mono text-gray-400 font-bold tracking-[0.2em] uppercase mt-0.5 md:mt-1">{deviceCode}</p>
                            )}
                        </div>
                    </div>
                    <span className={`px-3 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border-0 shadow-sm transition-all group-hover:shadow-md w-fit ${statusColor}`}>
                        {statusDisplay}
                    </span>
                </div>

                {/* Sensor Data Bento Grid */}
                <div className="grid grid-cols-2 gap-3 md:gap-4 relative">
                    <div className="bg-gradient-to-br from-orange-50/40 to-amber-50/40 p-3 md:p-5 rounded-xl md:rounded-[1.75rem] border border-orange-100/30 group-hover:border-orange-200 transition-colors">
                        <div className="flex items-center gap-2 md:gap-2.5 mb-2 md:mb-3">
                            <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <Thermometer className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                            </div>
                            <span className="text-[9px] md:text-[10px] font-black text-orange-600/70 uppercase tracking-widest">Suhu</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl md:text-3xl font-black text-gray-900 leading-none">
                                {typeof temp === 'number' ? temp.toFixed(1) : temp}
                            </span>
                            <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase">°C</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50/40 to-indigo-50/40 p-3 md:p-5 rounded-xl md:rounded-[1.75rem] border border-blue-100/30 group-hover:border-blue-200 transition-colors">
                        <div className="flex items-center gap-2 md:gap-2.5 mb-2 md:mb-3">
                            <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Droplets className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                            </div>
                            <span className="text-[9px] md:text-[10px] font-black text-blue-600/70 uppercase tracking-widest">Keasaman</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl md:text-3xl font-black text-gray-900 leading-none">
                                {typeof ph === 'number' ? ph.toFixed(2) : ph}
                            </span>
                            <span className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-tight">pH</span>
                        </div>
                    </div>

                    <div className="col-span-2 bg-gradient-to-r from-emerald-50/40 to-primary/5 p-3 md:p-5 rounded-xl md:rounded-[1.75rem] border border-primary/10 group-hover:border-primary/20 transition-colors flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Waves className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                            </div>
                            <div>
                                <span className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest block mb-0.5 md:mb-1">Level Air</span>
                                <div className="flex items-baseline gap-1.5 md:gap-2">
                                    <span className="text-xl md:text-2xl font-black text-gray-900 leading-none">
                                        {typeof waterLevel === 'number' ? waterLevel : waterLevel || '--'}
                                    </span>
                                    <span className="text-[9px] md:text-[10px] font-black text-primary uppercase">% Kapasitas</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-16 md:w-24 h-1.5 md:h-2 bg-gray-100/50 rounded-full overflow-hidden border border-gray-100 p-0.5 flex-shrink-0">
                            <div 
                                className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full transition-all duration-1000 shadow-sm" 
                                style={{ width: `${typeof waterLevel === 'number' ? waterLevel : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-50 flex items-center justify-between relative group/btn">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-gray-300'}`} />
                        <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] ${isOnline ? 'text-emerald-600' : 'text-gray-400'}`}>
                            {isOnline ? 'Sistem Terkoneksi' : 'Koneksi Terputus'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary opacity-30 group-hover:opacity-100 transform translate-x-2 md:translate-x-4 group-hover:translate-x-0 transition-all duration-500 ease-out">
                        Lihat 
                        <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

