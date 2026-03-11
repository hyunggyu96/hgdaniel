'use client';

import { usePathname } from 'next/navigation';
import { useFeedMode } from './FeedModeContext';
import FeedModeToggle from './FeedModeToggle';

export default function FeedModeToggleWrapper() {
    const pathname = usePathname();
    const { feedMode, toggleFeedMode } = useFeedMode();

    // Only show on the news page
    if (pathname !== '/') return null;

    return <FeedModeToggle feedMode={feedMode} onToggle={toggleFeedMode} />;
}
