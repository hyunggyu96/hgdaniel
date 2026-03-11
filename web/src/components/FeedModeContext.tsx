'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUser } from './UserContext';

type FeedMode = 'classic' | 'ai';

interface FeedModeContextType {
    feedMode: FeedMode;
    setFeedMode: (mode: FeedMode) => void;
    toggleFeedMode: () => void;
}

const FeedModeContext = createContext<FeedModeContextType>({
    feedMode: 'classic',
    setFeedMode: () => {},
    toggleFeedMode: () => {},
});

export function FeedModeProvider({ children }: { children: React.ReactNode }) {
    const { userId } = useUser();
    const [feedMode, setFeedModeState] = useState<FeedMode>('classic');
    const [loaded, setLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('feedMode');
        if (saved === 'ai' || saved === 'classic') {
            setFeedModeState(saved);
        }
        setLoaded(true);
    }, []);

    // Override with server preferences when logged in
    useEffect(() => {
        if (!userId || !loaded) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/user/preferences', { cache: 'no-store' });
                if (!res.ok || cancelled) return;
                const json = await res.json();
                const p = json?.preferences || {};
                if (!cancelled && (p.feedMode === 'ai' || p.feedMode === 'classic')) {
                    setFeedModeState(p.feedMode);
                    localStorage.setItem('feedMode', p.feedMode);
                }
            } catch { /* ignore */ }
        })();
        return () => { cancelled = true; };
    }, [userId, loaded]);

    const setFeedMode = useCallback((mode: FeedMode) => {
        setFeedModeState(mode);
        localStorage.setItem('feedMode', mode);
        if (userId) {
            void fetch('/api/user/preferences', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferences: { feedMode: mode } }),
            });
        }
    }, [userId]);

    const toggleFeedMode = useCallback(() => {
        setFeedMode(feedMode === 'classic' ? 'ai' : 'classic');
    }, [feedMode, setFeedMode]);

    return (
        <FeedModeContext.Provider value={{ feedMode, setFeedMode, toggleFeedMode }}>
            {children}
        </FeedModeContext.Provider>
    );
}

export function useFeedMode() {
    return useContext(FeedModeContext);
}
