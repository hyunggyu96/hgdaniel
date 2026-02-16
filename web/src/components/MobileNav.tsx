'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { Home, Menu, Star, X, ChevronRight, MessageSquarePlus } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import KeywordSuggestionModal from './KeywordSuggestionModal';

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSuggestOpen, setIsSuggestOpen] = useState(false);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const selectedCategory = searchParams?.get('category');
    const isCollections = searchParams?.get('collections') === 'true';
    const searchQuery = searchParams?.get('search');
    const isOverview = !selectedCategory && !isCollections && !searchQuery;

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname, searchParams]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <>
            {/* Spacer for fixed bottom nav */}
            <div className="h-20 md:hidden" />

            {/* Bottom Nav Bar */}
            <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 md:hidden flex items-center justify-around px-2 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 transition-colors duration-300">
                <Link
                    href="/"
                    prefetch={false}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 ${isOverview ? 'text-[#3182f6]' : 'text-gray-400 hover:text-foreground'}`}
                >
                    <Home className={`w-5 h-5 ${isOverview ? 'fill-current' : ''}`} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
                </Link>

                <button
                    onClick={() => setIsOpen(true)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 ${selectedCategory && !isCollections ? 'text-[#3182f6]' : 'text-gray-400 hover:text-foreground'}`}
                >
                    <Menu className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Sector</span>
                </button>

                <Link
                    href="/?collections=true"
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 ${isCollections ? 'text-[#3182f6]' : 'text-gray-400 hover:text-foreground'}`}
                >
                    <Star className={`w-5 h-5 ${isCollections ? 'fill-current' : ''}`} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Saved</span>
                </Link>
            </nav>

            {/* Category Drawer/Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsOpen(false)} />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl border-t border-gray-200 dark:border-gray-800 max-h-[85vh] overflow-y-auto flex flex-col p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl shadow-black/20">
                        <div className="sticky top-0 bg-white dark:bg-gray-900 z-10 pb-4 mb-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-black text-foreground uppercase tracking-tighter">Select Sector</h3>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Filter news by industry</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} aria-label="Close menu" className="p-2 -mr-2 text-gray-400 hover:text-foreground bg-gray-100 dark:bg-gray-800 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2 pb-10 overflow-y-auto">
                            <Link
                                href="/"
                                prefetch={false}
                                className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border transition-all ${isOverview ? 'bg-[#3182f6] border-[#3182f6] text-white' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Home className="w-4 h-4" />
                                    <span className="font-bold text-sm uppercase tracking-wide">Overview</span>
                                </div>
                                {isOverview && <ChevronRight className="w-4 h-4" />}
                            </Link>

                            <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

                            {CATEGORIES.map(cat => (
                                <Link
                                    key={cat}
                                    href={`/?category=${encodeURIComponent(cat)}`}
                                    className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border transition-all ${selectedCategory === cat ? 'bg-[#3182f6] border-[#3182f6] text-white' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    <span className="font-bold text-sm uppercase tracking-wide">{cat}</span>
                                    {selectedCategory === cat && <ChevronRight className="w-4 h-4" />}
                                </Link>
                            ))}

                            <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />

                            {/* Keyword Suggestion Button for Mobile */}
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsSuggestOpen(true);
                                }}
                                className="w-full flex items-center justify-between px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <MessageSquarePlus className="w-4 h-4 text-blue-400" />
                                    <span className="font-bold text-sm text-foreground/80 uppercase tracking-wide">Keyword Suggestion</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                            </button>

                        </div>
                    </div>
                </div>
            )}

            <KeywordSuggestionModal
                isOpen={isSuggestOpen}
                onClose={() => setIsSuggestOpen(false)}
            />
        </>
    );
}
