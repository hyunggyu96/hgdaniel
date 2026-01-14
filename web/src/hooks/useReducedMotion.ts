'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect user's "Reduce Motion" preference
 * Returns true if user prefers reduced motion (accessibility/performance)
 */
export function useReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        // Check if window is available (SSR safety)
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        // Set initial value
        setPrefersReducedMotion(mediaQuery.matches);

        // Listen for changes
        const handleChange = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(event.matches);
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return prefersReducedMotion;
}

/**
 * Hook to detect if device is likely low-end
 * Based on hardware concurrency and device memory (if available)
 */
export function useIsLowEndDevice(): boolean {
    const [isLowEnd, setIsLowEnd] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const nav = navigator as any;

        // Check hardware concurrency (CPU cores)
        const cores = nav.hardwareConcurrency || 4;

        // Check device memory (GB) - Chrome only
        const memory = nav.deviceMemory || 4;

        // Consider low-end if: <4 cores OR <4GB RAM
        setIsLowEnd(cores < 4 || memory < 4);
    }, []);

    return isLowEnd;
}
