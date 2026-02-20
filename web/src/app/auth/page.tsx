'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import AuthForm, { type AuthMode } from '@/components/auth/AuthForm';
import { useUser } from '@/components/UserContext';

function sanitizeNextPath(raw: string | null): string {
    if (!raw) return '/';
    if (!raw.startsWith('/')) return '/';
    if (raw.startsWith('//')) return '/';
    return raw;
}

function resolveMode(raw: string | null): AuthMode {
    return raw === 'register' ? 'register' : 'login';
}

export default function AuthPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { userId } = useUser();

    const nextPath = useMemo(() => sanitizeNextPath(searchParams?.get('next') || null), [searchParams]);
    const mode = useMemo(() => resolveMode(searchParams?.get('mode') || null), [searchParams]);

    if (userId) {
        return (
            <main className="min-h-[calc(100vh-180px)] bg-gray-50/70 dark:bg-gray-950 px-4 py-10">
                <div className="mx-auto w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">이미 로그인된 상태입니다</h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{userId} 계정으로 접속 중입니다.</p>
                    <div className="mt-5 flex justify-center gap-2">
                        <button
                            onClick={() => router.push(nextPath)}
                            className="rounded-xl bg-[#3182f6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b64da]"
                        >
                            계속 진행
                        </button>
                        <Link
                            href="/"
                            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                        >
                            홈으로
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-[calc(100vh-180px)] bg-gray-50/70 dark:bg-gray-950 px-4 py-10">
            <div className="mx-auto w-full max-w-lg">
                <Link
                    href={nextPath}
                    className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                    이전으로
                </Link>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="mb-4">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">계정 로그인</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            로그인 후 북마크, Ask AI, 논문 저장 기능을 이용할 수 있습니다.
                        </p>
                    </div>

                    <AuthForm
                        initialMode={mode}
                        onSuccess={() => {
                            router.replace(nextPath);
                        }}
                    />
                </div>
            </div>
        </main>
    );
}

