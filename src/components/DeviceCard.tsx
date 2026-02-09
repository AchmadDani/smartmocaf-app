'use client';

import Link from 'next/link';

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
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100/80 hover:shadow-2xl hover:shadow-[#009e3e]/10 hover:border-[#009e3e]/20 transition-all duration-500 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#009e3e]/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                {/* Header */}
                <div className="flex items-center justify-between mb-6 relative">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className={`w-3.5 h-3.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]' : 'bg-gray-300'} transition-all duration-500`} />
                            {isOnline && <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25" />}
                        </div>
                        <div>
                            <h3 className="font-extrabold text-gray-900 group-hover:text-[#009e3e] transition-colors leading-tight text-lg">{name}</h3>
                            {deviceCode && (
                                <p className="text-[10px] font-mono text-gray-400 font-bold tracking-widest uppercase mt-0.5">{deviceCode}</p>
                            )}
                        </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusColor}`}>
                        {statusDisplay}
                    </span>
                </div>

                {/* Sensor Data Bento Grid */}
                <div className="grid grid-cols-1 gap-3 relative">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 p-4 rounded-[1.25rem] border border-orange-100/50 group-hover:border-orange-200 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                                    </svg>
                                </div>
                                <span className="text-[10px] font-bold text-orange-600/70 uppercase tracking-wider">Suhu</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-gray-900 leading-none">
                                    {typeof temp === 'number' ? temp.toFixed(1) : temp}
                                </span>
                                <span className="text-sm font-bold text-gray-400">°C</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-4 rounded-[1.25rem] border border-blue-100/50 group-hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.48 0L12 2.69z"/>
                                    </svg>
                                </div>
                                <span className="text-[10px] font-bold text-blue-600/70 uppercase tracking-wider">Keasaman</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-gray-900 leading-none">
                                    {typeof ph === 'number' ? ph.toFixed(2) : ph}
                                </span>
                                <span className="text-[10px] font-black text-blue-400 ml-1">pH</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#009e3e]/5 to-[#00c853]/10 p-4 rounded-[1.25rem] border border-[#009e3e]/10 group-hover:border-[#009e3e]/30 transition-colors flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#009e3e]/10 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#009e3e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.48 0L12 2.69z"/>
                                </svg>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-[#009e3e] uppercase tracking-wider block mb-0.5">Level Air</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-black text-gray-900 leading-none">
                                        {typeof waterLevel === 'number' ? waterLevel : waterLevel || '--'}
                                    </span>
                                    <span className="text-xs font-bold text-[#009e3e]/60">%</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Progress micro-indicator */}
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-[#009e3e] to-[#00c853] transition-all duration-1000" 
                                style={{ width: `${typeof waterLevel === 'number' ? waterLevel : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between relative group/btn">
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                            {isOnline ? 'Sistem Aktif' : 'Terputus'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#009e3e] opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        Detail
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}
