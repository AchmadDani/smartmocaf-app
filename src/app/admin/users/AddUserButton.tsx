'use client';

import { useState } from 'react';
import AddUserDialog from '@/components/AddUserDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AddUserButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="gap-2 shadow-lg shadow-primary/20 font-bold"
            >
                <Plus className="h-5 w-5" />
                Tambah User
            </Button>
            <AddUserDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}

