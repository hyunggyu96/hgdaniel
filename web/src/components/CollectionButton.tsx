'use client';

import { Star } from 'lucide-react';
import { useCollection } from './CollectionContext';
import { useUser } from './UserContext';

export default function CollectionButton({ newsLink, newsTitle, size = 14 }: { newsLink: string, newsTitle: string, size?: number }) {
    const { isInCollection, toggleCollection } = useCollection();
    const { userId } = useUser();
    const inCollection = isInCollection(newsLink);
    const isLoggedIn = !!userId;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isLoggedIn) {
            toggleCollection(newsLink, newsTitle);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={!isLoggedIn}
            title={!isLoggedIn ? "로그인이 필요합니다" : ""}
            aria-label={inCollection ? "Remove from collections" : "Add to collections"}
            className={`group/star p-1 rounded-lg transition-all ${isLoggedIn ? 'hover:bg-white/10' : 'cursor-not-allowed opacity-30 shadow-none'}`}
        >
            <Star
                style={{ width: `${size}px`, height: `${size}px` }}
                className={`transition-all ${inCollection
                    ? 'fill-yellow-400 text-yellow-400'
                    : isLoggedIn ? 'text-white/30 group-hover/star:text-yellow-400' : 'text-white/20'
                    }`}
            />
        </button>
    );
}
