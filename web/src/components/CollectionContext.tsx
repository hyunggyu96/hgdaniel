'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from './UserContext';

interface CollectionContextType {
    collections: string[];
    isInCollection: (link: string) => boolean;
    toggleCollection: (link: string, title?: string) => void;
    collectionCount: number;
    isLoading: boolean;
    limitReached: boolean;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export function CollectionProvider({ children }: { children: React.ReactNode }) {
    const { userId } = useUser();
    const [collections, setCollections] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [limitReached, setLimitReached] = useState(false);

    const loadCollections = useCallback(async () => {
        if (!userId) {
            setCollections([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/collections?type=news', { cache: 'no-store' });
            if (!res.ok) {
                const body = await res.text().catch(() => '');
                console.error('[Collections] GET failed', res.status, body);
                setCollections([]);
                return;
            }
            const data = await res.json();
            setCollections(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('[Collections] load failed', error);
            setCollections([]);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        void loadCollections();
    }, [loadCollections]);

    // Keep a ref in sync so toggleCollection never closes over stale state
    const collectionsRef = useRef(collections);
    collectionsRef.current = collections;

    const isInCollection = useCallback((link: string) => {
        return collections.includes(link);
    }, [collections]);

    const toggleCollection = useCallback((link: string, title?: string) => {
        const inCollection = collectionsRef.current.includes(link);

        if (inCollection) {
            // Optimistic remove
            setCollections((prev) => prev.filter((l) => l !== link));
            void fetch('/api/collections', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'news', link }),
            }).then(async (res) => {
                if (!res.ok) {
                    const body = await res.text().catch(() => '');
                    console.error('[Collections] DELETE failed', res.status, body);
                    setCollections((prev) => prev.includes(link) ? prev : [...prev, link]);
                }
            }).catch((err) => {
                console.error('[Collections] DELETE error', err);
                setCollections((prev) => prev.includes(link) ? prev : [...prev, link]);
            });
            return;
        }

        // Optimistic add
        setLimitReached(false);
        setCollections((prev) => prev.includes(link) ? prev : [...prev, link]);
        void fetch('/api/collections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'news', link, title, url: link }),
        }).then(async (res) => {
            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                if (json?.code === 'COLLECTION_LIMIT') {
                    setLimitReached(true);
                }
                setCollections((prev) => prev.filter((l) => l !== link));
            }
        }).catch((err) => {
            console.error('[Collections] POST error', err);
            setCollections((prev) => prev.filter((l) => l !== link));
        });
    }, []); // stable — no deps needed, uses ref for current state

    const value: CollectionContextType = {
        collections,
        isInCollection,
        toggleCollection,
        collectionCount: collections.length,
        isLoading,
        limitReached,
    };

    return (
        <CollectionContext.Provider value={value}>
            {children}
        </CollectionContext.Provider>
    );
}

export function useCollection() {
    const context = useContext(CollectionContext);
    if (context === undefined) {
        throw new Error('useCollection must be used within a CollectionProvider');
    }
    return context;
}
