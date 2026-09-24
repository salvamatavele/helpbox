'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/context';
import {
  Search,
  Send,
  AlertCircle,
  MessageCircle,
  Sparkles,
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
      setMessageSuccess('Mensagem enviada com sucesso para a assistência social!');
      setTimeout(() => setMessageSuccess(''), 4000);
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
        return { label: t.statusSubmitted, bg: 'bg-amber-100 text-amber-900 border-amber-200' };
      case 'IN_TRIAGE':
        return { label: t.statusInTriage, bg: 'bg-blue-100 text-blue-900 border-blue-200' };
      case 'IN_PROGRESS':
        return { label: t.statusInProgress, bg: 'bg-teal-100 text-teal-900 border-teal-200' };
      case 'WAITING_INFO':
        return { label: t.statusWaitingInfo, bg: 'bg-purple-100 text-purple-900 border-purple-200' };
      case 'REFERRED':
        return { label: t.statusReferred, bg: 'bg-indigo-100 text-indigo-900 border-indigo-200' };
      case 'RESOLVED':
        return { label: t.statusResolved, bg: 'bg-emerald-100 text-emerald-900 border-emerald-200' };
      case 'CLOSED':
        return { label: t.statusClosed, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-800 border-slate-200' };
    }
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-8">
      {/* Title */}
      <div className="text-center sm:text-left space-y-2">
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
        className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-7 gap-3 items-end"
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
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
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
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-semibold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer h-[42px]"
          >
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'A pesquisar...' : t.btnSearch}</span>
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Case Details View */}
      {caseData && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Status Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                  {caseData.trackingCode}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">
                  {caseData.title}
                </h2>
              </div>
              <div className="shrink-0">
                <span
                  className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                    getStatusBadge(caseData.status).bg
                  }`}
                >
                  {getStatusBadge(caseData.status).label}
                </span>
              </div>
            </div>

            {/* Metadata badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
              <div>
                <span className="block text-slate-400 font-medium">Data de Registo</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(caseData.createdAt, language)}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-medium">Categoria</span>
                <span className="font-semibold text-slate-800">
                  {caseData.category}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-medium">Identificação</span>
                <span className="font-semibold text-emerald-700">
                  {caseData.isAnonymous ? 'Estritamente Anónimo' : 'Identificado'}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 font-medium">Departamento</span>
                <span className="font-semibold text-slate-800">
                  {caseData.departmentName || 'Triagem Geral'}
                </span>
              </div>
            </div>

            {/* Description Body */}
            <div className="pt-3 border-t border-slate-100">
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Relato Submetido:
              </span>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 whitespace-pre-wrap">
                {caseData.description}
              </p>
            </div>
          </div>

          {/* Conversation & Responses Timeline */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MessageCircle className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-base">
                {t.messagesTitle}
              </h3>
            </div>

            <div className="space-y-4">
              {caseData.messages.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">
                  {t.noMessagesYet}
                </p>
              ) : (
                caseData.messages.map((msg) => {
                  const isStaff = msg.senderType === 'STAFF';
                  const isSystem = msg.senderType === 'SYSTEM';

                  return (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl border leading-relaxed text-sm ${
                        isStaff
                          ? 'bg-teal-50/80 border-teal-200 text-teal-950 sm:mr-8'
                          : isSystem
                          ? 'bg-slate-50 border-slate-200 text-slate-700'
                          : 'bg-emerald-50/80 border-emerald-200 text-emerald-950 sm:ml-8'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5 opacity-80">
                        <span className="flex items-center gap-1">
                          {isStaff && <Sparkles className="w-3.5 h-3.5 text-teal-700" />}
                          {msg.senderName || (isStaff ? 'Assistência Social' : 'Utente')}
                        </span>
                        <span className="font-normal text-[11px]">
                          {formatDate(msg.createdAt, language)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Follow-up reply box */}
            <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                {t.sendFollowupTitle}
              </label>

              {messageSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  {messageSuccess}
                </div>
              )}

              <textarea
                rows={3}
                required
                value={followupText}
                onChange={(e) => setFollowupText(e.target.value)}
                placeholder={t.sendFollowupPlaceholder}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 placeholder:text-slate-400 resize-y"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSendingMessage}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingMessage ? t.sendingMessage : t.btnSendMessage}</span>
                </button>
              </div>
            </form>
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
