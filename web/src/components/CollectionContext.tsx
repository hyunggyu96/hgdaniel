'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';

interface CollectionContextType {
    collections: string[];
    isInCollection: (link: string) => boolean;
    toggleCollection: (link: string, title?: string) => void;
    collectionCount: number;
    isLoading: boolean;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export function CollectionProvider({ children }: { children: React.ReactNode }) {
    const { userId } = useUser();
    const [collections, setCollections] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const isInCollection = useCallback((link: string) => {
        return collections.includes(link);
    }, [collections]);

    const toggleCollection = useCallback((link: string, title?: string) => {
        const inCollection = collections.includes(link);

        if (inCollection) {
            setCollections((prev) => prev.filter((l) => l !== link));
            void fetch('/api/collections', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'news', link }),
            }).then((res) => {
                if (!res.ok) void loadCollections();
            });
            return;
        }

        setCollections((prev) => [...prev, link]);
        void fetch('/api/collections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'news', link, title, url: link }),
        }).then((res) => {
            if (!res.ok) void loadCollections();
        });
    }, [collections, loadCollections]);

    const value: CollectionContextType = {
        collections,
        isInCollection,
        toggleCollection,
        collectionCount: collections.length,
        isLoading,
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
