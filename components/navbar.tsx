'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { ShieldCheck, HeartHandshake, LogOut, Globe } from 'lucide-react';

export function Navbar() {
  const { t, language, toggleLanguage } = useTranslation();

  const handleQuickExit = () => {
    // Immediate redirect to safe site and replace history
    window.location.replace('https://www.google.com');
  };

  // Keyboard shortcut for rapid exit in distress situations (Escape key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Prevent accidental triggers if inside a modal or input, but if pressed outside inputs, trigger exit
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          handleQuickExit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-teal-900/10 shadow-xs transition-colors">
      {/* Top Discretion & Anonymity Bar */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 text-teal-100 text-xs px-3 sm:px-4 py-1.5 flex items-center justify-between border-b border-teal-800/40 w-full overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span className="truncate font-medium tracking-wide text-[11px] sm:text-xs">
            {t.anonymousGuarantee}
          </span>
        </div>

        <button
          onClick={handleQuickExit}
          title="Saída Imediata de Emergência (Prima Esc)"
          className="ml-2 inline-flex items-center gap-1.5 text-[11px] font-semibold bg-rose-700/90 hover:bg-rose-800 text-white px-2.5 py-0.5 rounded-lg transition-all duration-150 shrink-0 shadow-xs hover:shadow-rose-900/20 active:scale-95 cursor-pointer"
        >
          <LogOut className="w-3 h-3" />
          <span>{t.quickExit}</span>
          <kbd className="hidden sm:inline-block ml-1 px-1 py-0.2 rounded bg-black/25 text-[9px] font-mono uppercase tracking-wider text-rose-100">
            Esc
          </kbd>
        </button>
      </div>

      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#2481cc] via-teal-700 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-[#2481cc]/20 group-hover:scale-105 transition-all duration-200">
            <HeartHandshake className="w-5 h-5" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-[#2481cc] transition-colors">
                Helpbox
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-sky-50 text-[#2481cc] border border-sky-200/60 hidden sm:inline-flex">
                v2.0
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium leading-none">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t.telegramOnlineBadge || 'Online • Apoio Ativo'}</span>
            </div>
          </div>
        </Link>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-2xs"
            title={t.switchLanguage}
          >
            <Globe className="w-3.5 h-3.5 text-[#2481cc]" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
