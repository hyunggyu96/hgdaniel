import React from 'react';

export default function Loading() {
    return (
        <div className="flex min-h-screen bg-[#101012]">
            {/* Sidebar Skeleton */}
            <div className="w-64 border-r border-white/5 p-6 space-y-8 hidden lg:block">
                <div className="h-4 w-24 bg-white/5 rounded animate-pulse mb-6"></div>
                <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-10 w-full bg-white/5 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>

            {/* Content Skeleton */}
            <div className="flex-1 p-12 space-y-24">
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl animate-pulse"></div>
                    <div className="h-12 w-96 bg-white/5 rounded-lg animate-pulse"></div>
                    <div className="h-3 w-48 bg-white/5 rounded animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-20">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-8">
                            <div className="h-8 w-32 bg-white/5 rounded animate-pulse"></div>
                            <div className="space-y-6">
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                                        <div className="h-3 w-20 bg-white/5 rounded animate-pulse"></div>
                                        <div className="h-4 w-full bg-white/10 rounded animate-pulse"></div>
                                        <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
