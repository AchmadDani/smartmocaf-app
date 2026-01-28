import Link from 'next/link';
import { ReactNode } from 'react';

interface DeviceCardProps {
    id: string;
    name: string;
    statusDisplay: string;
    statusColor: string;
    temp: string | number;
    ph: string | number;
    href?: string;
}

export default function DeviceCard({ id, name, statusDisplay, statusColor, temp, ph, href }: DeviceCardProps) {
    return (
        <Link href={href || `/devices/${id}`} className="block">
            <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor}`}>
                            {statusDisplay}
                        </span>
                    </div>
                    <div className="text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg>
                        {temp}°C
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.48 0L12 2.69z" /><path d="M16 13a3 3 0 0 1-5.66 0" /><path d="M12 16a2 2 0 0 1 2-2" /></svg>
                        pH {ph}
                    </div>
                </div>
            </div>
        </Link>
    );
}
