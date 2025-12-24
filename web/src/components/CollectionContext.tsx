'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCollections, addToCollection, removeFromCollection } from '@/lib/collectionUtils';
import { useUser } from './UserContext';

interface CollectionContextType {
    collections: string[];
    isInCollection: (link: string) => boolean;
    toggleCollection: (link: string) => void;
    collectionCount: number;
    isLoading: boolean;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export function CollectionProvider({ children }: { children: React.ReactNode }) {
    const { userId } = useUser();
    const [collections, setCollections] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial load and sync
    useEffect(() => {
        const loadCollections = async () => {
            console.log(`[Collections] Loading for user: ${userId || 'GUEST'}`);
            setIsLoading(true);
            if (userId) {
                try {
                    const res = await fetch(`/api/collections?userId=${encodeURIComponent(userId)}`);
                    if (res.ok) {
                        const dbCollections = await res.json();
                        console.log(`[Collections] Fetched ${dbCollections.length} items from server`);

                        const guestCollections = getCollections();
                        if (guestCollections.length > 0) {
                            console.log(`[Collections] Merging ${guestCollections.length} guest items...`);
                            for (const link of guestCollections) {
                                if (!dbCollections.includes(link)) {
                                    await fetch('/api/collections', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ userId, link })
                                    });
                                    dbCollections.push(link);
                                }
                            }
                            localStorage.removeItem('news_collections_links');
                            console.log('[Collections] Merge complete');
                        }
                        setCollections(dbCollections);
                    }
                } catch (error) {
                    console.error('[Collections] Load failed:', error);
                    setCollections(getCollections());
                }
            } else {
                const local = getCollections();
                console.log(`[Collections] Loaded ${local.length} items from local storage`);
                setCollections(local);
            }
            setIsLoading(false);
        };

        loadCollections();
    }, [userId]);

    // Check if news is in collection
    const checkInCollection = useCallback((link: string) => {
        return collections.includes(link);
    }, [collections]);

    // Toggle collection with optimistic update & server sync
    const handleToggleCollection = useCallback(async (link: string) => {
        const inCollection = collections.includes(link);
        console.log(`[Collections] Toggling ${inCollection ? 'REMOVE' : 'ADD'} for ${link.slice(0, 30)}...`);

        if (inCollection) {
            setCollections(prev => prev.filter(l => l !== link));
            if (userId) {
                const res = await fetch('/api/collections', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, link })
                });
                if (!res.ok) console.error('[Collections] DELETE failed');
            } else {
                removeFromCollection(link);
            }
        } else {
            setCollections(prev => [...prev, link]);
            if (userId) {
                const res = await fetch('/api/collections', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, link })
                });
                if (!res.ok) console.error('[Collections] POST failed');
            } else {
                addToCollection(link);
            }
        }
    }, [collections, userId]);

    const value: CollectionContextType = {
        collections,
        isInCollection: checkInCollection,
        toggleCollection: handleToggleCollection,
        collectionCount: collections.length,
        isLoading
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
