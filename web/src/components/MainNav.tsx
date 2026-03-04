'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageContext';
import { useTier } from '@/hooks/useTier';
import type { Feature } from '@/lib/tiers';

type NavItem = {
    labelKey: string;
    href: string;
    feature?: Feature;
};

const NAV_ITEMS: NavItem[] = [
    { labelKey: 'nav_news', href: '/' },
    { labelKey: 'nav_insights', href: '/insights' },
    { labelKey: 'nav_company', href: '/company', feature: 'company' },
    { labelKey: 'nav_policy', href: '/policy', feature: 'policy' },
    { labelKey: 'nav_conferences', href: '/conferences' },
    { labelKey: 'nav_about', href: '/about' },
];

export default function MainNav() {
    const pathname = usePathname();
    const { t } = useLanguage();
    const { can } = useTier();

    return (
        <div className="w-full border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm transition-colors duration-300">
            <nav className="max-w-[1600px] mx-auto px-4 md:px-6 flex items-center justify-center gap-12 h-14 overflow-x-auto scrollbar-hide">
                {NAV_ITEMS.map((item) => {
                    const isActive = item.href === '/'
                        ? pathname === '/'
                        : pathname?.startsWith(item.href);
                    const isLocked = item.feature && !can(item.feature);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative h-full flex items-center gap-1.5 text-[15px] font-bold transition-colors whitespace-nowrap tracking-tight",
                                isActive
                                    ? "text-[#3182f6]"
                                    : isLocked
                                        ? "text-gray-300 dark:text-gray-600"
                                        : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {t(item.labelKey)}
                            {isLocked && <Lock className="w-3 h-3" />}
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
