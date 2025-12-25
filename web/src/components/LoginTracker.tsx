'use client';

import { useEffect } from 'react';
import { useUser } from './UserContext';

export default function LoginTracker() {
    const { userId } = useUser();

    useEffect(() => {
        const handleGlobalClick = async (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest('a');
            if (anchor && anchor.href && userId) {
                const url = anchor.href;
                const title = anchor.innerText || anchor.title || 'No Title';
                if (url.startsWith('http') && !url.includes(window.location.host)) {
                    try {
                        await fetch('/api/log-login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId, title: title.trim(), link: url })
                        });
                    } catch (err) {
                        console.error('Failed to log login click', err);
                    }
                }
            }
        };
        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, [userId]);

    return null;
}
