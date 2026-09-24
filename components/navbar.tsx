'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { ShieldCheck, HeartHandshake, LogOut, Globe, FileText, Search, Lock } from 'lucide-react';

export function Navbar() {
  const { t, language, toggleLanguage } = useTranslation();
  const pathname = usePathname();

  const handleQuickExit = () => {
    // Immediate redirect to safe site and replace history
    window.location.replace('https://www.google.com');
  };

  const navLinks = [
    { href: '/', label: t.navHome, icon: HeartHandshake },
    { href: '/new-case', label: t.navNewCase, icon: FileText },
    { href: '/track', label: t.navTrack, icon: Search },
    { href: '/admin/dashboard', label: t.navAdmin, icon: Lock },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Discretion & Anonymity Bar */}
      <div className="bg-teal-900 text-teal-100 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 max-w-4xl mx-auto w-full">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-300 shrink-0" />
          <span className="truncate">{t.anonymousGuarantee}</span>
        </div>
        <button
          onClick={handleQuickExit}
          title={t.quickExit}
          className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium bg-red-600/90 hover:bg-red-700 text-white px-2 py-0.5 rounded-md transition-colors shrink-0 shadow-xs cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          <span>{t.quickExit}</span>
        </button>
      </div>

      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
              Helpbox
            </span>
            <p className="text-[11px] text-slate-500 font-medium leading-none hidden sm:block">
              Acolhimento & Escuta Social no Anonimato
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 ml-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title={t.switchLanguage}
          >
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span>{language.toUpperCase()}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
