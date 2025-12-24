'use client';

import { useCollection } from './CollectionContext';

export default function CollectionCount() {
    const { collectionCount } = useCollection();

    if (collectionCount === 0) return null;

    return (
        <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400 text-[10px] font-bold">
            {collectionCount}
        </span>
    );
}
