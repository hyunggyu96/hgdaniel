import type { Metadata } from "next";
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

const noto = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Aesthetic Intelligence | AI Media Terminal for Medical Market",
  description: "Real-time industry stream and professional analysis for the medical aesthetics market.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${noto.className} bg-[#101012] text-white selection:bg-blue-500/30`}>
        <UserProvider>
          <CollectionProvider>
            {/* Header / Brand (GNB) */}
            <header className="px-4 md:px-6 py-3 md:py-4 border-b border-white/5 bg-[#101012]/80 backdrop-blur-md sticky top-0 z-50">
              <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 md:gap-8 h-auto md:h-12">
                {/* Left: Brand */}
                <Link href="/" prefetch={false} className="flex items-center gap-0 sm:gap-3 shrink-0 hover:opacity-80 transition-opacity">
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-[#3182f6] rounded-[10px] md:rounded-[14px] flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 text-sm md:text-base">HG</div>
                  <div className="hidden sm:block">
                    <span className="font-bold text-base md:text-lg tracking-tight block leading-none">Aesthetic Intelligence</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Professional Terminal</span>
                  </div>
                </Link>

                {/* Center: Search */}
                <div className="flex flex-1 justify-center max-w-2xl px-2 sm:px-4">
                  <Suspense fallback={<div className="w-full max-w-md h-10 bg-white/5 rounded-xl border border-white/10 animate-pulse" />}>
                    <SearchBar />
                  </Suspense>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden lg:block">
                    <HeaderStatus />
                  </div>
                  <LoginButton />
                </div>
              </div>
            </header>

            {children}

            <Suspense fallback={null}>
              <MobileNav />
            </Suspense>

            {/* Footer */}
            <footer className="bg-[#000000] text-white py-32 border-t border-white/5">
              <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-24">
                  <div className="space-y-8 max-w-sm">
                    <h2 className="text-3xl font-black tracking-tighter uppercase leading-none">INDUSTRY <span className="text-[#3182f6]">TERMINAL</span></h2>
                    <p className="text-sm font-medium text-white/40 uppercase leading-relaxed tracking-wider">
                      Global-scale intelligence for aesthetics. Precision analysis for the medical industry.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-24 uppercase font-black text-[11px] tracking-[0.3em]">
                    <div className="space-y-8">
                      <p className="text-[#3182f6]">Platform</p>
                      <ul className="space-y-4 text-white/40">
                        <li className="hover:text-white cursor-pointer transition-colors">Terminal</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Insights</li>
                      </ul>
                    </div>
                    <div className="space-y-8">
                      <p className="text-[#3182f6]">Policy</p>
                      <ul className="space-y-4 text-white/40">
                        <li className="hover:text-white cursor-pointer transition-colors">Privacy</li>
                        <li className="hover:text-white cursor-pointer transition-colors">Legal</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em] pt-12 border-t border-white/5 flex justify-between items-center">
                  <span>&copy; 2025 ALL RIGHTS RESERVED.</span>
                  <span className="text-blue-500/30">BUILT BY HG INC.</span>
                </div>
              </div>
            </footer>
          </CollectionProvider>
        </UserProvider>
      </body>
    </html>
  );
}
