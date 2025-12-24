'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { Home, Menu, Star, X, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const selectedCategory = searchParams?.get('category');
    const isCollections = searchParams?.get('collections') === 'true';

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
            <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#101012] border-t border-white/10 z-50 md:hidden flex items-center justify-around px-2 backdrop-blur-xl bg-[#101012]/90">
                <Link
                    href="/"
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 ${!selectedCategory && !isCollections ? 'text-[#3182f6]' : 'text-white/40 hover:text-white'}`}
                >
                    <Home className={`w-5 h-5 ${!selectedCategory && !isCollections ? 'fill-current' : ''}`} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
                </Link>

                <button
                    onClick={() => setIsOpen(true)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 ${selectedCategory && !isCollections ? 'text-[#3182f6]' : 'text-white/40 hover:text-white'}`}
                >
                    <Menu className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Sector</span>
                </button>

                <Link
                    href="/?collections=true"
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 ${isCollections ? 'text-[#3182f6]' : 'text-white/40 hover:text-white'}`}
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
                    <div className="absolute bottom-0 left-0 right-0 bg-[#161618] rounded-t-3xl border-t border-white/10 max-h-[85vh] overflow-y-auto flex flex-col p-6 animate-in slide-in-from-bottom duration-300 shadow-2xl shadow-black">
                        <div className="sticky top-0 bg-[#161618] z-10 pb-4 mb-2 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-black text-white uppercase tracking-tighter">Select Sector</h3>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Filter news by industry</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} aria-label="Close menu" className="p-2 -mr-2 text-white/40 hover:text-white bg-white/5 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-2 pb-10 overflow-y-auto">
                            <Link
                                href="/"
                                className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border transition-all ${!selectedCategory && !isCollections ? 'bg-[#3182f6] border-[#3182f6] text-white' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Home className="w-4 h-4" />
                                    <span className="font-bold text-sm uppercase tracking-wide">Overview</span>
                                </div>
                                {(!selectedCategory && !isCollections) && <ChevronRight className="w-4 h-4" />}
                            </Link>

                            <div className="h-px bg-white/5 my-2" />

                            {CATEGORIES.map(cat => (
                                <Link
                                    key={cat}
                                    href={`/?category=${encodeURIComponent(cat)}`}
                                    className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border transition-all ${selectedCategory === cat ? 'bg-[#3182f6] border-[#3182f6] text-white' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10'}`}
                                >
                                    <span className="font-bold text-sm uppercase tracking-wide">{cat}</span>
                                    {selectedCategory === cat && <ChevronRight className="w-4 h-4" />}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
