'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
    userId: string | null;
    login: (id: string) => void;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [userId, setUserId] = useState<string | null>(null);

    // Initial load from localStorage
    useEffect(() => {
        const storedUserId = localStorage.getItem('hg_user_id');
        if (storedUserId) {
            setUserId(storedUserId);
        }
    }, []);

    const login = (id: string) => {
        const trimmedId = id.trim();
        if (trimmedId) {
            setUserId(trimmedId);
            localStorage.setItem('hg_user_id', trimmedId);
        }
    };

    const logout = () => {
        setUserId(null);
        localStorage.removeItem('hg_user_id');
    };

    return (
        <UserContext.Provider value={{ userId, login, logout }}>
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
