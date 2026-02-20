'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthResult {
    ok: boolean;
    error?: string;
}

interface UserContextType {
    userId: string | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<AuthResult>;
    register: (username: string, password: string) => Promise<AuthResult>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

async function parseUserFromMe(): Promise<string | null> {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.user?.username || null;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const username = await parseUserFromMe();
            setUserId(username);
        } catch (error) {
            console.error('[UserContext] refreshUser failed', error);
            setUserId(null);
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
        return { ok: true };
    };

    const register = async (username: string, password: string): Promise<AuthResult> => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: json?.error || 'Register failed' };
        setUserId(json?.user?.username || null);
        return { ok: true };
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('[UserContext] logout failed', error);
        } finally {
            setUserId(null);
        }
    };

    return (
        <UserContext.Provider value={{ userId, isLoading, login, register, logout, refreshUser }}>
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
