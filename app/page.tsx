'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import {
  ShieldCheck,
  HeartHandshake,
  Search,
  Lock,
  ArrowRight,
  EyeOff,
  UserCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/70 via-slate-50 to-white py-14 sm:py-20 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Subtle Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 text-teal-800 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.tagline}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-snug">
            {t.heroTitle}
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {t.heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/new-case"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm sm:text-base shadow-lg shadow-teal-700/25 hover:shadow-teal-700/35 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <HeartHandshake className="w-5 h-5 text-teal-200" />
              <span>{t.btnStartAnonymous}</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
            </Link>

            <Link
              href="/track"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100/80 text-slate-700 font-semibold text-sm sm:text-base border border-slate-300/80 shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>{t.btnTrackCase}</span>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <EyeOff className="w-4 h-4 text-emerald-600" />
              Zero Rastreamento de IP
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-600" />
              Código Criptográfico Único
            </span>
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-cyan-600" />
              Identificação Opcional
            </span>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t.safetyTitle}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.safetyDesc}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-teal-700">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Proteção e anonimato garantidos</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t.empathyTitle}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.empathyDesc}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Acolhimento com sensibilidade</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-5">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t.trackingTitle}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.trackingDesc}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-cyan-700">
              <CheckCircle2 className="w-4 h-4 text-cyan-600" />
              <span>Canal bidirecional seguro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Practical Guide / How it Works */}
      <section className="bg-slate-100/80 border-y border-slate-200/80 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-xl sm:text-2xl font-bold text-slate-900 mb-8">
            Como Funciona o Acolhimento em 3 Passos Simples
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Relate a Situação
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Descreva o seu pedido ou queixa sem necessidade de se identificar.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Guarde o Código e PIN
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Receba a sua chave única de rastreio para ver o progresso do caso.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h4 className="font-semibold text-slate-900 text-sm mb-1">
                Receba Orientação
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed">
                Aceda às respostas do assistente social e envie mais detalhes quando quiser.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
