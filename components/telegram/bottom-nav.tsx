'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import {
  MessageSquare,
  PlusCircle,
  Search,
  ShieldCheck,
} from 'lucide-react';

export function TelegramBottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: t.navTelegramChats || 'Conversas',
      icon: MessageSquare,
      exact: true,
    },
    {
      href: '/new-case',
      label: t.navTelegramNew || 'Novo',
      icon: PlusCircle,
      exact: false,
      isSpecial: true,
    },
    {
      href: '/track',
      label: t.navTelegramTrack || 'Consultar',
      icon: Search,
      exact: false,
    },
    {
      href: '/admin/dashboard',
      label: t.navTelegramSupport || 'Apoio',
      icon: ShieldCheck,
      exact: false,
    },
  ];

  return (
    <nav
      aria-label="Navegação Principal Telegram"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 telegram-bottom-bar px-2 py-1 select-none transition-all duration-200 shadow-calm"
    >
      <div className="max-w-md mx-auto flex items-center justify-around w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-0.5 px-1 transition-all duration-150 rounded-xl group cursor-pointer ${
                isActive
                  ? 'text-[#2481cc] font-bold'
                  : 'text-slate-400 hover:text-slate-700 active:scale-95'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-9 sm:w-10 h-6 rounded-full transition-all duration-150 ${
                  isActive
                    ? 'bg-sky-50 text-[#2481cc] scale-105 shadow-2xs border border-sky-100/80'
                    : 'group-hover:bg-slate-100/60 text-slate-500'
                } ${item.isSpecial && !isActive ? 'text-[#2481cc]' : ''}`}
              >
                <Icon
                  className={`w-4.5 h-4.5 transition-transform duration-150 ${
                    isActive ? 'scale-105 stroke-[2.3]' : 'stroke-[1.8]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-0.5 w-1 h-1 bg-[#2481cc] rounded-full animate-pulse" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 leading-none transition-colors ${
                  isActive ? 'font-bold text-[#2481cc]' : 'font-medium text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
