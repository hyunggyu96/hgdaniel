import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import React, { Suspense } from 'react';
import HeaderStatus from '@/components/HeaderStatus';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { CollectionProvider } from '@/components/CollectionContext';
import { UserProvider } from '@/components/UserContext';
import LoginButton from '@/components/LoginButton';
import MobileNav from '@/components/MobileNav';
import MainNav from '@/components/MainNav';
import { GoogleAnalytics } from '@next/third-parties/google';
import { LanguageProvider } from '@/components/LanguageContext';
import { ThemeProvider } from '@/components/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Toaster } from 'sonner';

const noto = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
});



export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Aesthetic Intelligence",
  description: "Global-scale intelligence for aesthetics. Precision analysis for the medical industry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />
      </head>
      <body className={`${noto.className} bg-background text-foreground selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300`}>
        <ThemeProvider>
          <LanguageProvider>
            <UserProvider>
              <CollectionProvider>
                {/* Header / Brand (GNB) */}
                {/* Header / Brand (GNB) */}
                <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 flex flex-col border-b border-transparent dark:border-gray-800 transition-colors duration-300">
                  <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-4 md:gap-8 h-auto px-4 md:px-6 pt-6 pb-2">
                    <Link href="/" prefetch={false} className="flex items-center shrink-0 hover:opacity-80 transition-opacity">
                      <span className="font-black text-xl md:text-2xl tracking-tighter text-gray-900 dark:text-gray-100 leading-none">
                        AESTHETIC INTELLIGENCE
                      </span>
                    </Link>

                    {/* Center: Search */}
                    <div className="flex flex-1 justify-center max-w-2xl px-2 sm:px-4">
                      <Suspense fallback={<div className="w-full max-w-md h-10 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse" />}>
                        <SearchBar />
                      </Suspense>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <ThemeToggle />
                      <LanguageSwitcher />
                      <div>
                        <HeaderStatus />
                      </div>
                      <LoginButton />
                    </div>
                  </div>

                  {/* Bottom: Navigation */}
                  <MainNav />
                  <Toaster position="top-center" richColors />
                </header>

                {children}

                <Suspense fallback={null}>
                  <MobileNav />
                </Suspense>

                {/* Footer */}
                <footer className="bg-gray-50 dark:bg-gray-900 text-foreground py-32 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
                  <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
                      <div className="space-y-8 max-w-sm">
                        <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">INDUSTRY <span className="text-[#3182f6]">TERMINAL</span></h2>
                        <p className="text-sm font-medium text-muted-foreground uppercase leading-relaxed tracking-wider">
                          Global-scale intelligence for aesthetics. Precision analysis for the medical industry.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-24 uppercase font-black text-[11px] tracking-[0.3em]">
                        <div className="space-y-8">
                          <p className="text-[#3182f6]">Platform</p>
                          <ul className="space-y-4 text-muted-foreground">
                            <li className="hover:text-foreground cursor-pointer transition-colors">Terminal</li>
                            <li className="hover:text-foreground cursor-pointer transition-colors">Insights</li>
                          </ul>
                        </div>
                        <div className="space-y-8">
                          <p className="text-[#3182f6]">Policy</p>
                          <ul className="space-y-4 text-muted-foreground">
                            <li className="hover:text-foreground cursor-pointer transition-colors">Privacy</li>
                            <li className="hover:text-foreground cursor-pointer transition-colors">Legal</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.5em] pt-12 border-t border-gray-200 dark:border-gray-800">
                      <span>&copy; 2025 ALL RIGHTS RESERVED.</span>
                    </div>
                  </div>
                </footer>
              </CollectionProvider>
            </UserProvider>
          </LanguageProvider>
        </ThemeProvider>

        {/* Google Analytics */}
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
      </body>
    </html>
  );
}
