'use client';

import React, { useState } from 'react';
import { useUser } from './UserContext';
import { User, LogIn, LogOut } from 'lucide-react';
import AuthModal from './auth/AuthModal';

export default function LoginButton() {
    const { userId, logout, isLoading } = useUser();
    const [showAuthModal, setShowAuthModal] = useState(false);

    if (isLoading) {
        return (
            <div className="h-10 w-28 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        );
    }

    if (userId) {
        return (
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 h-10 rounded-xl">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-500" />
                </div>
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">{userId}</span>
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
                className="flex items-center gap-2 bg-[#3182f6] hover:bg-[#1b64da] px-3 sm:px-5 h-10 rounded-xl text-white text-[11px] font-bold transition-all shadow-lg shadow-blue-500/10 active:scale-95 group uppercase tracking-widest shrink-0"
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
