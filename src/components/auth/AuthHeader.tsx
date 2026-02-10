'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function AuthHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                    <Image
                        src="/assets/images/logos/Logo Growify Tech + Smart Mocaf.png"
                        alt="Growify x SmartMocaf"
                        width={180}
                        height={48}
                        className="h-10 w-auto object-contain"
                        priority
                    />
                </Link>
                <div className="flex items-center gap-3">
                    <Link href="/auth/login" className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2 transition-colors">
                        Masuk
                    </Link>
                    <Link href="/auth/register" className="text-sm font-semibold text-white bg-[#009e3e] hover:bg-[#007d31] px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#009e3e]/20 hover:shadow-xl hover:shadow-[#009e3e]/30">
                        Daftar
                    </Link>
                </div>
            </div>
        </header>
    );
}
