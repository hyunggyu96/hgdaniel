'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { label: 'AI Newsfeed', href: '/' },
    { label: 'Insights & Research', href: '/insights' },
    { label: 'Company Brief', href: '/company' },
    { label: 'Policy & RA', href: '/policy' },
    { label: 'Global Conferences', href: '/conferences' },
    { label: 'About', href: '/about' },
];

export default function MainNav() {
    const pathname = usePathname();

    return (
        <div className="w-full border-b border-gray-100 bg-white/50 backdrop-blur-sm">
            <nav className="max-w-[1600px] mx-auto px-4 md:px-6 flex items-center justify-center gap-12 h-14 overflow-x-auto scrollbar-hide">
                {NAV_ITEMS.map((item) => {
                    const isActive = item.href === '/'
                        ? pathname === '/'
                        : pathname?.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative h-full flex items-center text-[15px] font-bold transition-colors whitespace-nowrap tracking-tight",
                                isActive
                                    ? "text-[#3182f6]"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {item.label}
                            {isActive && (
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3182f6]" />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
