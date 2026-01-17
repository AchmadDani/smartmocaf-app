'use client';

type Tab = 'monitoring' | 'control';

interface DeviceTabsProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
}

export default function DeviceTabs({ activeTab, onTabChange }: DeviceTabsProps) {
    return (
        <div className="flex w-full bg-white p-1 rounded-lg">
            <button
                onClick={() => onTabChange('monitoring')}
                className={`flex-1 py-2 text-center rounded-md text-sm font-medium transition-colors ${activeTab === 'monitoring'
                        ? 'bg-[#bd7e7e] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
            >
                Monitoring
            </button>
            <button
                onClick={() => onTabChange('control')}
                className={`flex-1 py-2 text-center rounded-md text-sm font-medium transition-colors ${activeTab === 'control'
                        ? 'bg-[#bd7e7e] text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
            >
                Kontrol
            </button>
        </div>
    );
}
