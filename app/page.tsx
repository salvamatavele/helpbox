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
  KeyRound,
  FileCheck2,
  CheckCheck,
  Send,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section with Serene Lighting & Anonymity Assurance */}
      <section className="relative overflow-hidden bg-radial-serene py-16 sm:py-24 px-4 sm:px-6 border-b border-teal-900/5">
        <div className="absolute inset-0 bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-7 animate-fade-in-up">
          {/* Calming Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100/90 text-teal-900 text-xs font-semibold shadow-xs border border-teal-200/80">
            <Sparkles className="w-3.5 h-3.5 text-teal-700 animate-pulse-subtle" />
            <span>{t.tagline}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-snug">
            {t.heroTitle}
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {t.heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/new-case"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm sm:text-base shadow-calm hover:shadow-calm-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
            >
              <HeartHandshake className="w-5 h-5 text-teal-200" />
              <span>{t.btnStartAnonymous}</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
            </Link>

            <Link
              href="/track"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-teal-50/50 text-slate-700 hover:text-slate-900 font-semibold text-sm sm:text-base border border-slate-300/80 shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <Search className="w-4 h-4 text-teal-700" />
              <span>{t.btnTrackCase}</span>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-6 text-xs font-medium text-slate-600 max-w-full">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-slate-200/60 shadow-2xs">
              <EyeOff className="w-4 h-4 text-emerald-600" />
              {t.zeroIpTracking}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-slate-200/60 shadow-2xs">
              <Lock className="w-4 h-4 text-teal-700" />
              {t.cryptoCodeGuarantee}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 border border-slate-200/60 shadow-2xs">
              <UserCheck className="w-4 h-4 text-cyan-600" />
              {t.optionalIdentification}
            </span>
          </div>

          {/* Telegram Interactive Chat Experience Preview */}
          <div className="pt-8 w-full max-w-xl mx-auto text-left px-1 sm:px-0">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-calm-lg overflow-hidden">
              {/* Telegram Window Top Header */}
              <div className="bg-white px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#2481cc] to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                    HB
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight flex items-center gap-1">
                      <span>Equipa de Acolhimento Social</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </h4>
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>online • canal sigiloso</span>
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-50 text-[#2481cc] border border-sky-200/60 font-semibold">
                  HB-7X29-84K
                </span>
              </div>

              {/* Telegram Wallpaper Area */}
              <div className="telegram-wallpaper p-4 space-y-3">
                <div className="flex justify-center">
                  <span className="telegram-bubble-system px-2.5 py-0.5 text-[10px] text-slate-500 font-medium border border-slate-200/60">
                    Acolhimento encriptado sem registo de IP
                  </span>
                </div>

                {/* Citizen Outgoing Bubble */}
                <div className="flex flex-col items-end">
                  <div className="telegram-bubble-out p-3 max-w-[85%] text-xs leading-relaxed shadow-xs">
                    <p className="font-medium">
                      Preciso de apoio confidencial relativamente a uma situação difícil no meu setor de trabalho...
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-sky-800 opacity-80">
                      <span>09:41</span>
                      <CheckCheck className="w-3.5 h-3.5 text-sky-700" />
                    </div>
                  </div>
                </div>

                {/* Staff Incoming Bubble */}
                <div className="flex flex-col items-start">
                  <div className="telegram-bubble-in p-3 max-w-[85%] text-xs leading-relaxed">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[#2481cc] mb-0.5">
                      <Sparkles className="w-3 h-3 text-[#2481cc]" />
                      <span>Dra. Joana • Assistência Social</span>
                    </div>
                    <p className="text-slate-700 font-normal">
                      Olá! O seu anonimato está 100% garantido. Estamos aqui para escutar e prestar o devido acompanhamento com total sigilo.
                    </p>
                    <div className="flex items-center justify-end mt-1 text-[10px] text-slate-400">
                      <span>09:42</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Telegram Input Pill Simulation */}
              <div className="bg-white p-2.5 border-t border-slate-100 flex items-center gap-2">
                <div className="flex-1 px-4 py-2 rounded-full bg-slate-100 text-xs text-slate-400 font-medium">
                  {t.sendFollowupPlaceholder}
                </div>
                <div className="w-8 h-8 rounded-full bg-[#2481cc] text-white flex items-center justify-center shadow-xs">
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section: Segurança, Empatia e Rastreabilidade */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t.ethicalCommitmentTitle}
          </h2>
          <p className="text-slate-600 text-sm">
            {t.ethicalCommitmentSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: Proteção e Anonimato */}
          <div className="card-interactive p-7 rounded-3xl bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mb-5 border border-teal-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t.safetyTitle}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.safetyDesc}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-teal-800">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
              <span>{t.safetyPillarGuarantee}</span>
            </div>
          </div>

          {/* Card 2: Acolhimento Empático */}
          <div className="card-interactive p-7 rounded-3xl bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-5 border border-emerald-100">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t.empathyTitle}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.empathyDesc}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{t.empathyPillarGuarantee}</span>
            </div>
          </div>

          {/* Card 3: Acompanhamento Seguro */}
          <div className="card-interactive p-7 rounded-3xl bg-white shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-800 flex items-center justify-center mb-5 border border-cyan-100">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t.trackingTitle}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t.trackingDesc}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-cyan-800">
              <CheckCircle2 className="w-4 h-4 text-cyan-700 shrink-0" />
              <span>{t.trackingPillarGuarantee}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Practical Guide / How it Works in 3 Steps */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-14 sm:py-18 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900">
              {t.howItWorksTitle}
            </h2>
            <p className="text-slate-600 text-sm max-w-lg mx-auto">
              {t.howItWorksSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t.step1Title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {t.step1Desc}
                </p>
              </div>
              <div className="text-teal-700 text-xs font-medium flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>{t.step1Badge}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t.step2Title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {t.step2Desc}
                </p>
              </div>
              <div className="text-teal-700 text-xs font-medium flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>{t.step2Badge}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t.step3Title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {t.step3Desc}
                </p>
              </div>
              <div className="text-teal-700 text-xs font-medium flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>{t.step3Badge}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
