'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoRefresh() {
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            // Only refresh if the tab is visible to save resources
            if (document.visibilityState === 'visible') {
                router.refresh();
            }
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [router]);

    return null;
}
