'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Tier } from '@/lib/authSession';

interface AuthResult {
    ok: boolean;
    error?: string;
}

interface UserContextType {
    userId: string | null;
    userTier: Tier;
    isAdmin: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<AuthResult>;
    register: (username: string, password: string, email: string, birthYear: number) => Promise<AuthResult>;
    logout: () => Promise<void>;
    deleteAccount: (password: string) => Promise<AuthResult>;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

async function parseUserFromMe(): Promise<{ username: string | null; tier: Tier; isAdmin: boolean }> {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return { username: null, tier: 'free', isAdmin: false };
    const json = await res.json();
    return {
        username: json?.user?.username || null,
        tier: json?.user?.tier || 'free',
        isAdmin: !!json?.user?.isAdmin,
    };
}

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [userTier, setUserTier] = useState<Tier>('free');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const { username, tier, isAdmin: admin } = await parseUserFromMe();
            setUserId(username);
            setUserTier(tier);
            setIsAdmin(admin);
        } catch (error) {
            console.error('[UserContext] refreshUser failed', error);
            setUserId(null);
            setUserTier('free');
            setIsAdmin(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void refreshUser();
    }, []);

    const login = async (username: string, password: string): Promise<AuthResult> => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: json?.error || 'Login failed' };
        setUserId(json?.user?.username || null);
        setUserTier(json?.user?.tier || 'free');
        setIsAdmin(!!json?.user?.isAdmin);
        return { ok: true };
    };

    const register = async (username: string, password: string, email: string, birthYear: number): Promise<AuthResult> => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, email, birthYear, agreedPrivacy: true, agreedTerms: true }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: json?.error || 'Register failed' };
        setUserId(json?.user?.username || null);
        setUserTier(json?.user?.tier || 'free');
        setIsAdmin(!!json?.user?.isAdmin);
        return { ok: true };
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('[UserContext] logout failed', error);
        } finally {
            setUserId(null);
            setUserTier('free');
            setIsAdmin(false);
        }
    };

    const deleteAccount = async (password: string): Promise<AuthResult> => {
        const res = await fetch('/api/auth/delete-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: json?.error || 'Delete failed' };
        setUserId(null);
        setUserTier('free');
        setIsAdmin(false);
        return { ok: true };
    };

    return (
        <UserContext.Provider value={{ userId, userTier, isAdmin, isLoading, login, register, logout, deleteAccount, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
