'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ShieldCheck, X } from 'lucide-react';
import AuthForm, { type AuthMode } from './AuthForm';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: AuthMode;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
        }
    }, [isOpen, initialMode]);

    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const currentQuery = searchParams?.toString();
    const currentPath = `${pathname || '/'}${currentQuery ? `?${currentQuery}` : ''}`;
    const next = encodeURIComponent(currentPath);

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <button
                type="button"
                aria-label="Close auth modal"
                onClick={onClose}
                className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            />

            <div className="relative z-[121] w-full max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">계정 인증</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">로그인 또는 회원가입</p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <AuthForm
                    initialMode={initialMode}
                    onModeChange={setMode}
                    onSuccess={() => {
                        onClose();
                    }}
                />

                <div className="mt-3 text-center">
                    <Link
                        href={`/auth?mode=${mode}&next=${next}`}
                        onClick={onClose}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        전체 페이지에서 진행하기
                    </Link>
                </div>
            </div>
        </div>
    );
}
