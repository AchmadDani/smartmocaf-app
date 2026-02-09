'use client';

import { useState } from 'react';
import AddUserDialog from '@/components/AddUserDialog';

export default function AddUserButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-[#009e3e] text-white px-5 py-3 rounded-xl hover:bg-[#007d31] transition-all font-bold flex items-center gap-2 shadow-lg shadow-[#009e3e]/20"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                Tambah User
            </button>
            <AddUserDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
