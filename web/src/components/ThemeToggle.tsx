"use client";

import React from 'react';
import { useTheme } from './ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            title={theme === 'light' ? '다크 모드' : '라이트 모드'}
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon size={15} className="text-gray-600" />
            ) : (
                <Sun size={15} className="text-yellow-400" />
            )}
        </button>
    );
}
