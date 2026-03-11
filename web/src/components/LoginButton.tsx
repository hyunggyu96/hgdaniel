'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { useUser } from './UserContext';
import { useTier } from '@/hooks/useTier';
import { useLanguage } from './LanguageContext';
import { User, LogIn, LogOut, Settings } from 'lucide-react';
import AuthModal from './auth/AuthModal';

export default function LoginButton() {
    const { userId, logout, isLoading } = useUser();
    const { tier } = useTier();
    const { language } = useLanguage();
    const isKo = language === 'ko';
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        if (showMenu) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showMenu]);

    if (isLoading) {
        return (
            <div className="h-8 w-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        );
    }

    if (userId) {
        return (
            <div className="relative flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 h-8 rounded-lg" ref={menuRef}>
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-500" />
                </div>
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">{userId}</span>
                {tier !== 'free' && (
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        tier === 'enterprise'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                        {tier === 'enterprise' ? 'ENT' : 'PRO'}
                    </span>
                )}
                <button
                    onClick={() => setShowMenu((v) => !v)}
                    aria-label="Settings"
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <Settings className="w-3 h-3 text-gray-400" />
                </button>

                {showMenu && (
                    <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800 z-50">
                        <Link
                            href="/account"
                            onClick={() => setShowMenu(false)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {isKo ? '내 계정' : 'My Account'}
                        </Link>
                        <button
                            onClick={() => { setShowMenu(false); void logout(); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            <LogOut className="w-3.5 h-3.5 text-gray-400" />
                            {isKo ? '로그아웃' : 'Logout'}
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 bg-[#3182f6] hover:bg-[#1b64da] px-3 sm:px-4 h-8 rounded-lg text-white text-[11px] font-bold transition-all shadow-sm active:scale-95 group uppercase tracking-wider shrink-0"
            >
                <LogIn className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                <span className="hidden sm:inline">Login</span>
            </button>

            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                initialMode="login"
            />
        </>
    );
}
