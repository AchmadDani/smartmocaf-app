'use client';

import Image from 'next/image';

export default function AuthFooter() {
    return (
        <footer className="w-full px-6 py-8 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        © 2026 Growify Tech
                    </p>
                    <div className="w-1 h-1 bg-gray-200 rounded-full" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        Innovillage 2025
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all cursor-crosshair">
                        <Image src="/assets/images/logos/Telkom University.png" alt="TelU" width={80} height={30} className="h-4 w-auto object-contain" />
                        <Image src="/assets/images/logos/Logo Telkom Indonesia.png" alt="Telkom" width={80} height={30} className="h-4 w-auto object-contain" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
