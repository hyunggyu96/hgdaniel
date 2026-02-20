'use client';

import { Star } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCollection } from './CollectionContext';
import { useUser } from './UserContext';

export default function CollectionButton({
    newsLink,
    newsTitle,
    size = 14,
}: {
    newsLink: string;
    newsTitle: string;
    size?: number;
}) {
    const { isInCollection, toggleCollection } = useCollection();
    const { userId } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const inCollection = isInCollection(newsLink);
    const isLoggedIn = !!userId;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoggedIn) {
            toggleCollection(newsLink, newsTitle);
            return;
        }

        const query = searchParams?.toString();
        const currentPath = `${pathname || '/'}${query ? `?${query}` : ''}`;
        const next = encodeURIComponent(currentPath);
        router.push(`/auth?mode=login&next=${next}`);
    };

    return (
        <button
            onClick={handleClick}
            title={!isLoggedIn ? '로그인 후 북마크를 저장할 수 있습니다.' : ''}
            aria-label={inCollection ? 'Remove from collections' : 'Add to collections'}
            className={`group/star p-1 rounded-lg transition-all ${isLoggedIn ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-70 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
            <Star
                style={{ width: `${size}px`, height: `${size}px` }}
                className={`transition-all ${inCollection
                    ? 'fill-yellow-400 text-yellow-400'
                    : isLoggedIn
                        ? 'text-gray-300 group-hover/star:text-yellow-400'
                        : 'text-gray-300 group-hover/star:text-blue-400'
                    }`}
            />
        </button>
    );
}
