// Collection management utilities using LocalStorage
// Future migration: Replace localStorage calls with Supabase queries

const STORAGE_KEY = 'news_collections_links';

export interface CollectionItem {
    link: string;
    addedAt: string;
}

/**
 * Get all collections from storage (returns array of links)
 */
export function getCollections(): string[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading collections:', error);
        return [];
    }
}

/**
 * Add news to collections
 */
export function addToCollection(link: string): void {
    const collections = getCollections();

    if (!collections.includes(link)) {
        collections.push(link);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    }
}

/**
 * Remove news from collections
 */
export function removeFromCollection(link: string): void {
    const collections = getCollections();
    const filtered = collections.filter(l => l !== link);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Check if news is in collections
 */
export function isInCollection(link: string): boolean {
    return getCollections().includes(link);
}

/**
 * Toggle collection status
 */
export function toggleCollection(link: string): boolean {
    const inCollection = isInCollection(link);

    if (inCollection) {
        removeFromCollection(link);
    } else {
        addToCollection(link);
    }

    return !inCollection;
}

/**
 * Get collection count
 */
export function getCollectionCount(): number {
    return getCollections().length;
}

/**
 * Clear all collections
 */
export function clearCollections(): void {
    localStorage.removeItem(STORAGE_KEY);
}
