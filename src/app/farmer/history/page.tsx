import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

interface Props {
    searchParams: Promise<{ id?: string }>;
}

export default async function DeviceHistoryPage({ searchParams }: Props) {
    const params = await searchParams;
    const deviceId = params.id;
    
    if (!deviceId) {
        redirect('/farmer');
    }

    const session = await getSession();

    if (!session) {
        redirect('/auth/login');
    }

    // Fetch device
    const device = await prisma.device.findUnique({
        where: { 
            id: deviceId,
            userId: session.userId
        }
    });

    if (!device) {
        notFound();
    }

    // Fetch telemetry history (30-min aggregated)
    const history = await prisma.telemetryHistory.findMany({
        where: { deviceId },
        orderBy: { recordedAt: 'desc' },
        take: 50
    });

    // Fetch recent telemetry for fallback
    const recentTelemetry = await prisma.telemetry.findMany({
        where: { deviceId },
        orderBy: { createdAt: 'desc' },
        take: 100
    });

    const historyData = history.length > 0 ? history : null;
    const telemetryData = recentTelemetry || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link 
                            href={`/farmer/${deviceId}`}
                            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-lg font-bold text-gray-900">Riwayat Data</h1>
                            <p className="text-xs text-gray-500">{device.name}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                {/* Summary Stats */}
                {telemetryData.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Suhu Terakhir</p>
                            <p className="text-xl font-bold text-gray-900">
                                {Number(telemetryData[0]?.tempC ?? 0).toFixed(1)}°C
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">pH Terakhir</p>
                            <p className="text-xl font-bold text-gray-900">
                                {Number(telemetryData[0]?.ph ?? 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Total Data</p>
                            <p className="text-xl font-bold text-gray-900">
                                {telemetryData.length}
                            </p>
                        </div>
                    </div>
                )}

                {/* History Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-900">Data Sensor</h2>
                        <p className="text-xs text-gray-500">
                            {historyData ? 'Data tersimpan setiap 30 menit' : 'Data real-time terbaru'}
                        </p>
                    </div>

                    {(historyData || telemetryData.length > 0) ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Waktu</th>
                                        <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Suhu</th>
                                        <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">pH</th>
                                        <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Air</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {historyData ? (
                                        historyData.map((item: any, index: number) => (
                                            <tr key={item.id.toString()} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {formatDate(item.recordedAt)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-mono">
                                                    <span className="text-orange-600">{Number(item.avgTempC)?.toFixed(1) ?? '--'}</span>
                                                    <span className="text-gray-400 text-xs">°C</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-mono">
                                                    <span className="text-blue-600">{Number(item.avgPh)?.toFixed(2) ?? '--'}</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-mono">
                                                    <span className="text-[#009e3e]">{Number(item.avgWaterLevel)?.toFixed(0) ?? '--'}</span>
                                                    <span className="text-gray-400 text-xs">%</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        telemetryData.slice(0, 30).map((item: any, index: number) => (
                                            <tr key={item.id.toString()} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {formatDate(item.createdAt)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-mono">
                                                    <span className="text-orange-600">{Number(item.tempC)?.toFixed(1) ?? '--'}</span>
                                                    <span className="text-gray-400 text-xs">°C</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-mono">
                                                    <span className="text-blue-600">{Number(item.ph)?.toFixed(2) ?? '--'}</span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-mono">
                                                    <span className="text-[#009e3e]">{Number(item.waterLevel)?.toFixed(0) ?? '--'}</span>
                                                    <span className="text-gray-400 text-xs">%</span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="3" y1="9" x2="21" y2="9"/>
                                    <line x1="9" y1="21" x2="9" y2="9"/>
                                </svg>
                            </div>
                            <p className="text-gray-500">Belum ada data riwayat</p>
                            <p className="text-sm text-gray-400 mt-1">Data akan mulai tersimpan setelah alat terhubung</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}
