import Link from 'next/link';

export default function DevicesPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">SmartMocaf</h1>

                <div className="space-y-4">
                    <DeviceCard
                        id="1"
                        name="Fermenter 01"
                        status="RUNNING"
                        temp={28}
                        ph={4.5}
                    />
                    <DeviceCard
                        id="2"
                        name="Fermenter 02"
                        status="IDLE"
                        temp={26}
                        ph={7.0}
                    />

                    <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-medium hover:border-[#bd7e7e] hover:text-[#bd7e7e] transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                        Add New Device
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeviceCard({ id, name, status, temp, ph }: { id: string, name: string, status: 'IDLE' | 'RUNNING', temp: number, ph: number }) {
    return (
        <Link href={`/devices/${id}`} className="block">
            <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${status === 'RUNNING' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {status === 'RUNNING' ? 'Berjalan' : 'Idle'}
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
