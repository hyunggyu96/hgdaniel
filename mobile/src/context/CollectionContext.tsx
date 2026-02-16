import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";

interface CollectionContextType {
  collections: string[];
  isInCollection: (link: string) => boolean;
  toggleCollection: (link: string) => boolean;
  collectionCount: number;
}

const CollectionContext = createContext<CollectionContextType>({
  collections: [],
  isInCollection: () => false,
  toggleCollection: () => false,
  collectionCount: 0,
});

const STORAGE_KEY = "news_collections_links";

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [collections, setCollections] = useState<string[]>([]);

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          setCollections(JSON.parse(stored));
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((updated: string[]) => {
    setCollections(updated);
    SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const isInCollection = useCallback(
    (link: string) => collections.includes(link),
    [collections]
  );

  const toggleCollection = useCallback(
    (link: string) => {
      const exists = collections.includes(link);
      if (exists) {
        persist(collections.filter((l) => l !== link));
      } else {
        persist([...collections, link]);
      }
      return !exists;
    },
    [collections, persist]
  );

  return (
    <CollectionContext.Provider
      value={{
        collections,
        isInCollection,
        toggleCollection,
        collectionCount: collections.length,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export const useCollections = () => useContext(CollectionContext);
