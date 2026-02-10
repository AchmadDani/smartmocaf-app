'use client';

interface UptimeChartProps {
    data: {
        label: string;
        uptimePercent: number;
        isOnline: boolean;
    }[];
}

export default function UptimeChart({ data }: UptimeChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p className="text-sm text-gray-400 font-medium">Belum ada data perangkat</p>
            </div>
        );
    }

    const maxItems = 8;
    const displayData = data.slice(0, maxItems);

    return (
        <div className="space-y-4">
            {/* Chart */}
            <div className="flex items-end gap-2 sm:gap-3 h-40 px-2">
                {displayData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                        {/* Value */}
                        <span className="text-[10px] font-bold text-gray-400 tabular-nums">
                            {item.uptimePercent}%
                        </span>
                        {/* Bar */}
                        <div className="w-full bg-gray-100 rounded-t-lg rounded-b-lg overflow-hidden relative" style={{ height: '100%' }}>
                            <div 
                                className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-1000 ease-out ${
                                    item.isOnline 
                                        ? 'bg-gradient-to-t from-[#009e3e] to-[#00c853]' 
                                        : 'bg-gradient-to-t from-gray-300 to-gray-200'
                                }`}
                                style={{ 
                                    height: `${Math.max(item.uptimePercent, 4)}%`,
                                    animationDelay: `${index * 100}ms`
                                }}
                            >
                                {item.isOnline && (
                                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white/40 rounded-full" />
                                )}
                            </div>
                        </div>
                        {/* Label */}
                        <span className="text-[9px] font-bold text-gray-400 truncate w-full text-center uppercase tracking-wider">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#009e3e]" />
                    <span className="text-[10px] font-medium text-gray-400">Online</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="text-[10px] font-medium text-gray-400">Offline</span>
                </div>
            </div>
        </div>
    );
}
