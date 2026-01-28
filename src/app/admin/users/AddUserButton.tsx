'use client';

import { useState } from 'react';
import AddUserDialog from '@/components/AddUserDialog';

export default function AddUserButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-[#bd7e7e] text-white px-4 py-2 rounded-lg hover:bg-[#a66b6b] transition-colors font-medium flex items-center gap-2"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                Tambah User
            </button>
            <AddUserDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
