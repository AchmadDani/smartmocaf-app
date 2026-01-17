'use client';

interface MonitoringPanelProps {
    temperature: number;
    ph: number;
    fermentationStatus: 'IDLE' | 'RUNNING' | 'DONE';
    onStartFermentation: () => void;
}

export default function MonitoringPanel({
    temperature,
    ph,
    fermentationStatus,
    onStartFermentation,
}: MonitoringPanelProps) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {/* Temperature Card */}
                <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex items-center gap-2 text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" /></svg>
                        <span className="font-medium text-sm">Suhu</span>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900">{temperature} C</div>
                        <div className="text-xs text-gray-500">Derajat</div>
                    </div>
                </div>

                {/* pH Card */}
                <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex items-center gap-2 text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.74 5.74a8 8 0 1 1-11.48 0L12 2.69z" /><path d="M16 13a3 3 0 0 1-5.66 0" /><path d="M12 16a2 2 0 0 1 2-2" /></svg>
                        <span className="font-medium text-sm">PH</span>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-gray-900">{ph}</div>
                        <div className="text-xs text-gray-500">Asam</div>
                    </div>
                </div>
            </div>

            {/* Fermentation Status */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-gray-800 font-medium mb-6">Status Fermentasi</h3>
                <div className="relative pl-2">

                    {/* Timeline Line */}
                    <div className="absolute left-[7px] top-2 bottom-4 w-0.5 bg-gray-200"></div>

                    {/* Steps */}
                    <div className="flex flex-col gap-6">
                        <TimelineItem
                            label="Belum di Mulai"
                            active={fermentationStatus === 'IDLE'}
                            completed={fermentationStatus === 'RUNNING' || fermentationStatus === 'DONE'}
                        />
                        <TimelineItem
                            label="Sedang Berlangsung"
                            active={fermentationStatus === 'RUNNING'}
                            completed={fermentationStatus === 'DONE'}
                        />
                        <TimelineItem
                            label="Selesai"
                            active={fermentationStatus === 'DONE'}
                            completed={false}
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={onStartFermentation}
                disabled={fermentationStatus !== 'IDLE'}
                className={`w-full font-medium py-3 rounded-xl mt-8 transition-colors ${fermentationStatus === 'IDLE'
                        ? 'bg-[#bd7e7e] text-white hover:bg-[#a66b6b]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
            >
                {fermentationStatus === 'IDLE' ? 'Mulai Fermentasi' : 'Fermentasi Berjalan'}
            </button>

        </div>
    );
}

function TimelineItem({ label, active, completed }: { label: string; active: boolean; completed: boolean }) {
    let dotClass = "bg-gray-800"; // default dark/black
    let textClass = "text-gray-800";

    if (active) {
        dotClass = "bg-[#bd7e7e] ring-4 ring-[#bd7e7e]/20"; // pinkish active
        textClass = "text-[#bd7e7e] font-medium";
    } else if (completed) {
        dotClass = "bg-gray-800";
        textClass = "text-gray-800";
    } else {
        dotClass = "bg-gray-800"; // Black dot for inactive steps in design
    }

    // Actually per reference: 
    // Belum di Mulai is pinkish
    // Sedang Berlangsung is black
    // Selesai is black
    // But logic usually implies state. 
    // Let's stick to the visual: The top one is pinkish in the image ("Belum di Mulai").
    // So maybe it just highlights the current state.

    return (
        <div className="flex items-center gap-4 relative z-10">
            <div className={`w-3 h-3 rounded-full ${dotClass}`}></div>
            <span className={`text-sm ${textClass}`}>{label}</span>
        </div>
    );
}
