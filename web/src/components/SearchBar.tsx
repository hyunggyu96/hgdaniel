'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');

    useEffect(() => {
        setSearchQuery(searchParams?.get('search') || '');
    }, [searchParams]);

    const handleSearch = (value: string) => {
        setSearchQuery(value);

        const params = new URLSearchParams(searchParams?.toString() || '');
        if (value.trim()) {
            params.set('search', value.trim());
            params.delete('page'); // Reset to page 1 when searching
        } else {
            params.delete('search');
        }

        router.push(`/?${params.toString()}`);
    };

    const clearSearch = () => {
        setSearchQuery('');
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.delete('search');
        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="relative w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="뉴스 검색..."
                    className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#3182f6] focus:border-transparent transition-all"
                />
                {searchQuery && (
                    <button
                        onClick={clearSearch}
                        aria-label="Clear search"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
