'use client';

import React, { useState } from 'react';
import { useUser } from './UserContext';
import { User, LogIn, LogOut, ChevronRight } from 'lucide-react';

export default function LoginButton() {
    const { userId, login, logout } = useUser();
    const [isHovered, setIsHovered] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const id = inputValue.trim();
        if (id) {
            login(id);
            setShowInput(false);
            setInputValue('');

            // Log Login
            try {
                await fetch('/api/log-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: id, provider: 'manual' })
                });
            } catch (err) {
                console.error('Login log failed', err);
            }
        }
    };

    if (userId) {
        return (
            <div
                className="flex items-center gap-3 bg-white border border-gray-200 px-4 h-10 rounded-xl hover:bg-gray-50 transition-all cursor-default group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <User className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">{userId}</span>
                </div>

                <button
                    onClick={logout}
                    aria-label="Logout"
                    className="p-1 hover:bg-red-500/20 rounded-lg transition-colors group-hover:opacity-100 opacity-0 lg:opacity-30"
                    title="Logout"
                >
                    <LogOut className="w-3 h-3 text-red-400" />
                </button>
            </div>
        );
    }

    if (showInput) {
        return (
            <form
                onSubmit={handleLogin}
                className="flex items-center bg-white border border-gray-200 h-10 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-all shadow-lg shadow-black/5"
            >
                <input
                    autoFocus
                    type="text"
                    placeholder="Enter ID..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="bg-transparent border-none outline-none px-4 py-2 text-[11px] text-foreground placeholder:text-muted-foreground w-32"
                />
                <button
                    type="submit"
                    aria-label="Submit login"
                    className="bg-blue-500 hover:bg-blue-600 px-3 h-full transition-colors flex items-center justify-center"
                >
                    <ChevronRight className="w-4 h-4 text-white" />
                </button>
                <button
                    type="button"
                    onClick={() => setShowInput(false)}
                    className="px-3 h-full flex items-center justify-center text-muted-foreground hover:text-foreground text-[10px] font-bold uppercase transition-colors"
                >
                    Esc
                </button>
            </form>
        );
    }

    return (
        <button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-2 bg-[#3182f6] hover:bg-[#1b64da] px-3 sm:px-5 h-10 rounded-xl text-white text-[11px] font-bold transition-all shadow-lg shadow-blue-500/10 active:scale-95 group uppercase tracking-widest shrink-0"
        >
            <LogIn className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Connect</span>
        </button>
    );
}
