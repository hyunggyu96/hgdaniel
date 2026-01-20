'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home } from 'lucide-react';

const NAV_ITEMS = [
    { label: 'AI Newsfeed', href: '/', icon: Home },
    { label: 'Insights & Research', href: '/insights' },
    { label: 'Company Brief', href: '/company' },
    { label: 'Policy & RA', href: '/policy' },
    { label: 'Global Conferences', href: '/conferences' },
];

export default function MainNav() {
    const pathname = usePathname();

    return (
        <nav className="hidden xl:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
                const isActive = item.href === '/'
                    ? pathname === '/'
                    : pathname?.startsWith(item.href);

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 tracking-tight",
                            isActive
                                ? "text-[#3182f6] bg-blue-50"
                                : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                        )}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}
