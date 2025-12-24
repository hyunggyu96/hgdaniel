'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/lib/constants';
import { ChevronRight } from 'lucide-react';
import CollectionCount from './CollectionCount';

export default function SideBar() {
    const searchParams = useSearchParams();
    const selectedCategory = searchParams.get('category'); // null for Overview
    const isCollections = searchParams.get('collections') === 'true';

    return (
        <aside className="w-64 flex-shrink-0 border-r border-white/5 bg-[#101012] p-6 hidden lg:block">
            <div className="space-y-8">
                <div>
                    <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-6">
                        Sector Watchlist
                    </h3>
                    <div className="space-y-1">
                        <Link
                            href="/"
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group flex items-center justify-between ${selectedCategory === null && !isCollections ? 'bg-[#3182f6] text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                        >
                            <span className="text-sm font-bold uppercase tracking-tight">Overview</span>
                            <ChevronRight
                                className={`w-4 h-4 transition-transform ${selectedCategory === null && !isCollections ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`}
                            />
                        </Link>
                        {CATEGORIES.map((category) => (
                            <Link
                                key={category}
                                href={`/?category=${encodeURIComponent(category)}`}
                                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group flex items-center justify-between ${selectedCategory === category ? 'bg-[#3182f6] text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                            >
                                <span className="text-sm font-bold uppercase tracking-tight">{category}</span>
                                <ChevronRight
                                    className={`w-4 h-4 transition-transform ${selectedCategory === category ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`}
                                />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Collections Section */}
                <div className="pt-6 border-t border-white/5">
                    <Link
                        href="/?collections=true"
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all group/collections ${isCollections ? 'bg-[#3182f6] text-white' : 'hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-yellow-400 text-lg">⭐</span>
                            <span className={`text-sm font-bold transition-colors uppercase tracking-tight ${isCollections ? 'text-white' : 'text-white/90 group-hover/collections:text-[#3182f6]'}`}>
                                Collections
                            </span>
                        </div>
                        <CollectionCount />
                    </Link>
                </div>

                <div className="pt-8 border-t border-white/5">
                    <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3182f6]"></span>
                            </span>
                            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                Live Monitoring
                            </p>
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed font-medium">
                            Tracking 102 medical aesthetic sectors with AI-powered real-time analysis.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
