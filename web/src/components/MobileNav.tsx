'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { Home, Star, Calendar as CalendarIcon } from 'lucide-react';

export default function MobileNav() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const isCollections = searchParams?.get('collections') === 'true';
    const isConferences = pathname === '/conferences';
    const selectedCategory = searchParams?.get('category');
    const searchQuery = searchParams?.get('search');
    const isOverview = !selectedCategory && !isCollections && !searchQuery && !isConferences;

    return (
        <>
            {/* Spacer for fixed bottom nav */}
            <div className="h-20 md:hidden" />

            {/* Bottom Nav Bar */}
            <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white/90 dark:bg-gray-900/90 border-t border-gray-200 dark:border-gray-800 z-50 md:hidden flex items-center justify-around px-4 backdrop-blur-xl transition-colors duration-300">
                <Link
                    href="/"
                    prefetch={false}
                    className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all ${isOverview ? 'text-[#3182f6]' : 'text-gray-400 hover:text-foreground'}`}
                >
                    <Home className={`w-5 h-5 ${isOverview ? 'fill-current' : ''}`} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
                </Link>

                <Link
                    href="/conferences"
                    className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all ${isConferences ? 'text-[#3182f6]' : 'text-gray-400 hover:text-foreground'}`}
                >
                    <CalendarIcon className={`w-5 h-5 ${isConferences ? 'fill-current' : ''}`} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Calendar</span>
                </Link>

                <Link
                    href="/?collections=true"
                    className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all ${isCollections ? 'text-[#3182f6]' : 'text-gray-400 hover:text-foreground'}`}
                >
                    <Star className={`w-5 h-5 ${isCollections ? 'fill-current' : ''}`} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Saved</span>
                </Link>
            </nav>
        </>
    );
}
