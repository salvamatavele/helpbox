'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import { PenLine } from 'lucide-react';

export function TelegramFab() {
  const { t } = useTranslation();
  const pathname = usePathname();

  // Hide FAB if user is already on the new case submission screen
  if (pathname === '/new-case') {
    return null;
  }

  return (
    <aside
      aria-label="Ação Rápida Telegram"
      className="fixed bottom-16 sm:bottom-18 right-4 sm:right-6 z-40 transition-all duration-300"
    >
      <Link
        href="/new-case"
        title={t.telegramFabTooltip || 'Novo Relato Anónimo'}
        className="telegram-fab flex items-center justify-center w-12 h-12 rounded-full text-white cursor-pointer group shadow-md"
      >
        <PenLine className="w-5 h-5 stroke-[2.2] group-hover:rotate-6 transition-transform duration-200" />
        <span className="sr-only">{t.telegramFabTooltip || 'Novo Relato Anónimo'}</span>
      </Link>
    </aside>
  );
}
