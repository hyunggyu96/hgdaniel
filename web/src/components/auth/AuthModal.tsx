'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ShieldCheck, X } from 'lucide-react';
import AuthForm, { type AuthMode } from './AuthForm';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: AuthMode;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) setMode(initialMode);
    }, [isOpen, initialMode]);

    useEffect(() => {
        if (!isOpen || !mounted) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, mounted]);

    const currentQuery = searchParams?.toString();
    const currentPath = `${pathname || '/'}${currentQuery ? `?${currentQuery}` : ''}`;
    const next = encodeURIComponent(currentPath);

    if (!mounted) return null;

    return createPortal((
        <AnimatePresence>
            {isOpen && (
                <div className="fixed left-0 top-0 z-[1300] h-[100dvh] w-screen flex items-center justify-center p-4 pointer-events-none">
                    <motion.button
                        type="button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        aria-label="Close auth modal"
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md pointer-events-auto"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[95vh] pointer-events-auto"
                    >
                        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 shrink-0">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-foreground leading-none">로그인/회원가입</h3>
                                    <p className="text-[11px] text-muted-foreground mt-1 leading-none">개인 컬렉션과 Ask AI를 이용할 수 있습니다.</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-foreground"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="overflow-y-auto px-5 py-5 custom-scrollbar bg-gray-50 dark:bg-gray-900/50">
                            <AuthForm
                                initialMode={initialMode}
                                onModeChange={setMode}
                                onSuccess={() => {
                                    onClose();
                                }}
                            />
                        </div>

                        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 text-center">
                            <Link
                                href={`/auth?mode=${mode}&next=${next}`}
                                onClick={onClose}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                전체 페이지에서 진행하기
                            </Link>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    ), document.body);
}
