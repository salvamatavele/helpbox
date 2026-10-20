'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import {
  Search,
  Send,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  CheckCheck,
  Paperclip,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CaseDisplay } from '@/lib/services/case-service';

function TrackCaseContent() {
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();

  const [trackingCode, setTrackingCode] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [caseData, setCaseData] = useState<CaseDisplay | null>(null);

  // Follow-up message state
  const [followupText, setFollowupText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState('');

  const fetchCase = useCallback(async (code: string, accessPin: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/cases/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingCode: code, pin: accessPin }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.caseNotFound);
      }
      setCaseData(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.caseNotFound;
      setErrorMessage(message);
      setCaseData(null);
    } finally {
      setIsLoading(false);
    }
  }, [t.caseNotFound]);

  // Auto-populate from URL query params
  useEffect(() => {
    const codeParam = searchParams.get('code');
    const pinParam = searchParams.get('pin');
    if (codeParam && pinParam) {
      setTrackingCode(codeParam);
      setPin(pinParam);
      void fetchCase(codeParam, pinParam);
    }
  }, [searchParams, fetchCase]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim() || !pin.trim()) {
      setErrorMessage('Por favor, indique o Código de Rastreio e o PIN.');
      return;
    }
    void fetchCase(trackingCode.trim(), pin.trim());
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupText.trim()) return;

    setIsSendingMessage(true);
    setMessageSuccess('');
    try {
      const res = await fetch('/api/cases/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingCode: caseData?.trackingCode,
          pin,
          action: 'ADD_MESSAGE',
          message: followupText.trim(),
        }),
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.error || 'Falha ao enviar mensagem');
      }

      setCaseData(updated);
      setFollowupText('');
      setMessageSuccess(t.messageSuccessAlert);
      setTimeout(() => setMessageSuccess(''), 4500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      alert(message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return { label: t.statusSubmitted, bg: 'bg-amber-50 text-amber-900 border-amber-200' };
      case 'IN_TRIAGE':
        return { label: t.statusInTriage, bg: 'bg-blue-50 text-blue-900 border-blue-200' };
      case 'IN_PROGRESS':
        return { label: t.statusInProgress, bg: 'bg-teal-50 text-teal-900 border-teal-200' };
      case 'WAITING_INFO':
        return { label: t.statusWaitingInfo, bg: 'bg-purple-50 text-purple-900 border-purple-200' };
      case 'REFERRED':
        return { label: t.statusReferred, bg: 'bg-indigo-50 text-indigo-900 border-indigo-200' };
      case 'RESOLVED':
        return { label: t.statusResolved, bg: 'bg-emerald-50 text-emerald-900 border-emerald-200' };
      case 'CLOSED':
        return { label: t.statusClosed, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  // Determine active step index for the calming progress timeline
  const getTimelineStepIndex = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 0;
      case 'IN_TRIAGE':
        return 1;
      case 'IN_PROGRESS':
      case 'WAITING_INFO':
      case 'REFERRED':
        return 2;
      case 'RESOLVED':
      case 'CLOSED':
        return 3;
      default:
        return 0;
    }
  };

  const timelineSteps = [
    { title: t.stepSubmittedTitle, desc: t.stepSubmittedDesc },
    { title: t.stepTriageTitle, desc: t.stepTriageDesc },
    { title: t.stepProgressTitle, desc: t.stepProgressDesc },
    { title: t.stepResolvedTitle, desc: t.stepResolvedDesc },
  ];

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-8 animate-fade-in-up">
      {/* Title */}
      <div className="text-center sm:text-left space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/80 text-teal-900 text-xs font-semibold border border-teal-200/60 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>{t.trackConfidentialBadge}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.trackTitle}
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          {t.trackSubtitle}
        </p>
      </div>

      {/* Search Box */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-white p-5 sm:p-7 rounded-3xl border border-teal-900/10 shadow-calm grid grid-cols-1 sm:grid-cols-7 gap-3.5 items-end transition-all"
      >
        <div className="sm:col-span-3 space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            {t.trackingCodeLabel}
          </label>
          <input
            type="text"
            required
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            placeholder={t.trackInputPlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-sm uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/25 focus:border-teal-700 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="sm:col-span-2 space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
            {t.accessPinLabel}
          </label>
          <input
            type="password"
            required
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={t.pinInputPlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 font-mono text-sm tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/25 focus:border-teal-700 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 disabled:bg-teal-400 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer h-[46px] active:scale-98"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t.searchingCase}</span>
              </span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>{t.btnSearch}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in-up">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Case Details View */}
      {caseData && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Calming Progress Timeline */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-teal-900/10 shadow-calm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t.trackProgressTitle}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(caseData.status).bg}`}>
                {getStatusBadge(caseData.status).label}
              </span>
            </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
              {timelineSteps.map((step, idx) => {
                const currentIdx = getTimelineStepIndex(caseData.status);
                const isCompleted = idx < currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div
                    key={step.title}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-teal-50/80 border-teal-600 ring-2 ring-teal-600/20 shadow-xs'
                        : isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200 text-slate-700'
                        : 'bg-slate-50/60 border-slate-200/70 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isCurrent ? (
                        <span className="relative flex h-3 w-3 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-700" />
                        </span>
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      )}
                      <h4 className={`text-xs font-bold ${isCurrent ? 'text-teal-950' : isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Case Metadata Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-teal-900/10 shadow-calm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200/60 font-bold">
                  {caseData.trackingCode}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  {caseData.title}
                </h2>
              </div>
            </div>

            {/* Metadata badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="block text-slate-400 font-medium mb-0.5">{t.recordDateLabel}</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(caseData.createdAt, language)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="block text-slate-400 font-medium mb-0.5">{t.colCategory}</span>
                <span className="font-semibold text-slate-800">
                  {caseData.category}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="block text-slate-400 font-medium mb-0.5">{t.identificationLabel}</span>
                <span className="font-semibold text-emerald-700">
                  {caseData.isAnonymous ? t.strictlyAnonymousLabel : t.identifiedLabel}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="block text-slate-400 font-medium mb-0.5">{t.departmentLabel}</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" />
                  {caseData.departmentName || 'Triagem Geral'}
                </span>
              </div>
            </div>

            {/* Description Body */}
            <div className="pt-2">
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                {t.submittedReportLabel}
              </span>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 whitespace-pre-wrap">
                {caseData.description}
              </p>
            </div>
          </div>

          {/* Telegram Messenger Experience */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-calm overflow-hidden">
            {/* Telegram Chat Header */}
            <div className="bg-white px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-[#2481cc] to-teal-600 flex items-center justify-center text-white shadow-xs font-bold text-sm">
                  <span>HB</span>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight flex items-center gap-1.5">
                    <span>{caseData.departmentName || 'Assistência Social & Ouvidoria'}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>online • sigilo ponta a ponta</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  {caseData.trackingCode}
                </span>
              </div>
            </div>

            {/* Telegram Wallpaper Message Canvas */}
            <div className="telegram-wallpaper p-4 sm:p-6 min-h-[320px] max-h-[560px] overflow-y-auto space-y-4">
              {/* Date / Security pill */}
              <div className="flex justify-center">
                <span className="telegram-bubble-system px-3 py-1 text-slate-500 font-medium border border-slate-200/50">
                  Canal confidencial ativado • {formatDate(caseData.createdAt, language)}
                </span>
              </div>

              {/* Initial Case Submission Bubble (Citizen Outgoing) */}
              <div className="flex flex-col items-end">
                <div className="telegram-bubble-out p-3.5 sm:p-4 max-w-[90%] sm:max-w-[78%] leading-relaxed text-xs sm:text-sm shadow-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold mb-1 opacity-80 text-sky-950">
                    <span>{caseData.isAnonymous ? t.strictlyAnonymousLabel : t.identifiedLabel}</span>
                    <span className="font-mono text-[10px]">{caseData.category}</span>
                  </div>
                  <p className="whitespace-pre-wrap font-medium">{caseData.description}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-sky-800 opacity-80">
                    <span>{formatDate(caseData.createdAt, language)}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-sky-700" />
                  </div>
                </div>
              </div>

              {/* Follow-up Messages */}
              {caseData.messages.map((msg) => {
                const isStaff = msg.senderType === 'STAFF';
                const isSystem = msg.senderType === 'SYSTEM';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <span className="telegram-bubble-system px-3 py-1 text-slate-500 font-medium border border-slate-200/60">
                        {msg.message}
                      </span>
                    </div>
                  );
                }

                if (isStaff) {
                  // Incoming Telegram bubble
                  return (
                    <div key={msg.id} className="flex flex-col items-start">
                      <div className="telegram-bubble-in p-3.5 sm:p-4 max-w-[90%] sm:max-w-[78%] leading-relaxed text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2481cc] mb-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#2481cc]" />
                          <span>{msg.senderName || 'Assistente Social'}</span>
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200/60">
                            Oficial
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-slate-800 font-normal">{msg.message}</p>
                        <div className="flex items-center justify-end mt-1 text-[10px] text-slate-400">
                          <span>{formatDate(msg.createdAt, language)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Citizen Outgoing Telegram bubble
                return (
                  <div key={msg.id} className="flex flex-col items-end">
                    <div className="telegram-bubble-out p-3.5 sm:p-4 max-w-[90%] sm:max-w-[78%] leading-relaxed text-xs sm:text-sm shadow-xs">
                      <p className="whitespace-pre-wrap font-medium">{msg.message}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-sky-800 opacity-80">
                        <span>{formatDate(msg.createdAt, language)}</span>
                        <CheckCheck className="w-3.5 h-3.5 text-sky-700" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Telegram Pill Input Bar */}
            <div className="bg-white p-3 sm:p-4 border-t border-slate-100">
              {messageSuccess && (
                <div className="mb-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in-up">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{messageSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  title="Anexar ficheiro confidencial"
                  className="p-2.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    required
                    value={followupText}
                    onChange={(e) => setFollowupText(e.target.value)}
                    placeholder={t.sendFollowupPlaceholder}
                    className="w-full px-4 py-2.5 rounded-full bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-[#2481cc]/50 focus:ring-2 focus:ring-[#2481cc]/20 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingMessage || !followupText.trim()}
                  className="w-10 h-10 rounded-full bg-[#2481cc] hover:bg-[#1a73b7] disabled:bg-slate-300 text-white flex items-center justify-center shrink-0 shadow-md shadow-[#2481cc]/20 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
                  title={t.btnSendMessage}
                >
                  {isSendingMessage ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 ml-0.5" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">A carregar consulta...</div>}>
      <TrackCaseContent />
    </Suspense>
  );
}
