'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { Download, X, ShieldCheck, Share, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / running in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // 2. Check if user dismissed prompt recently (within last 7 days)
    const dismissedAt = localStorage.getItem('helpbox_pwa_dismissed');
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) {
        return;
      }
    }

    // 3. Listen for standard beforeinstallprompt event (Android / Desktop Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait 3 seconds after page load before showing prompt gently
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. iOS detection (iPhone/iPad/iPod safari)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !/crios|fxios/.test(userAgent);
    if (isIosDevice) {
      setIsIos(true);
      setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('Utilizador aceitou a instalação do Helpbox PWA');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('helpbox_pwa_dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      className="fixed bottom-16 sm:bottom-18 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-fade-in-up"
    >
      <div className="relative bg-white/95 backdrop-blur-xl border border-sky-200/80 rounded-2xl p-4 shadow-calm-lg text-slate-900 transition-all">
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          {/* App Emblem */}
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2481cc] via-teal-700 to-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-[#2481cc]/25">
            <ShieldCheck className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5">
              <h3 id="pwa-install-title" className="font-bold text-sm text-slate-900 leading-tight">
                {t.pwaInstallTitle}
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {t.pwaInstallDesc}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer"
          >
            {t.btnPwaLater}
          </button>

          {isIos ? (
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#2481cc] bg-sky-50 px-2.5 py-1.5 rounded-xl border border-sky-100">
              <Share className="w-3.5 h-3.5 shrink-0" />
              <span>{t.pwaIosHint}</span>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#2481cc] to-teal-700 hover:from-[#1a73b7] hover:to-teal-800 text-white font-semibold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.btnPwaInstall}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
