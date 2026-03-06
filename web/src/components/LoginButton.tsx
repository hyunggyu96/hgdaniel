'use client';

import React, { useState } from 'react';
import { useUser } from './UserContext';
import { useTier } from '@/hooks/useTier';
import { User, LogIn, LogOut } from 'lucide-react';
import AuthModal from './auth/AuthModal';

export default function LoginButton() {
    const { userId, logout, isLoading } = useUser();
    const { tier } = useTier();
    const [showAuthModal, setShowAuthModal] = useState(false);

    if (isLoading) {
        return (
            <div className="h-8 w-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        );
    }

    if (userId) {
        return (
            <div className="flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 h-8 rounded-lg">
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
                    onClick={() => void logout()}
                    aria-label="Logout"
                    className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Logout"
                >
                    <LogOut className="w-3 h-3 text-red-400" />
                </button>
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
