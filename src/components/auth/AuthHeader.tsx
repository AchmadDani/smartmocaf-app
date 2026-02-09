'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function AuthHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto">
                <Link href="/" className="block transition-transform hover:scale-105 active:scale-95">
                    <Image 
                        src="/assets/images/logos/Logo Growify Tech + Smart Mocaf.png"
                        alt="SmartMocaf"
                        width={140}
                        height={40}
                        className="h-8 w-auto object-contain"
                    />
                </Link>
            </div>
            <div className="flex gap-3 pointer-events-auto">
                <Link 
                    href="/auth/login" 
                    className="px-6 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest text-[#009e3e] bg-white shadow-xl shadow-green-900/5 hover:shadow-[#009e3e]/20 transition-all active:scale-95"
                >
                    Masuk
                </Link>
                <Link 
                    href="/auth/register" 
                    className="px-6 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-[#009e3e] shadow-xl shadow-[#009e3e]/30 hover:bg-[#007d31] transition-all active:scale-95"
                >
                    Daftar
                </Link>
            </div>
        </header>
    );
}
