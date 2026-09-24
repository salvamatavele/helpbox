'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import {
  ShieldAlert,
  Copy,
  Check,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  MessageSquareWarning,
  Sparkles,
  Info,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

type CaseCategoryType = 'SOCIAL_SUPPORT' | 'COMPLAINT' | 'GRIEVANCE' | 'SUGGESTION' | 'OTHER';
type PriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export default function NewCasePage() {
  const { t } = useTranslation();

  const [category, setCategory] = useState<CaseCategoryType>('SOCIAL_SUPPORT');
  const [priority, setPriority] = useState<PriorityType>('MEDIUM');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [contactName, setContactName] = useState('');
  const [contactChannel, setContactChannel] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<{
    trackingCode: string;
    accessPin: string;
  } | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim() || !description.trim()) {
      setErrorMessage('Por favor, preencha o resumo e a descrição do seu caso.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          priority,
          title: title.trim(),
          description: description.trim(),
          isAnonymous,
          contactName: isAnonymous ? undefined : contactName.trim(),
          contactChannel: isAnonymous ? undefined : contactChannel.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao submeter o caso.');
      }

      setSuccessData({
        trackingCode: data.trackingCode,
        accessPin: data.accessPin,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro inesperado ao submeter o relato.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, type: 'code' | 'pin') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2500);
      } else {
        setCopiedPin(true);
        setTimeout(() => setCopiedPin(false), 2500);
      }
    });
  };

  if (successData) {
    return (
      <div className="flex-1 py-12 px-4 sm:px-6 max-w-2xl mx-auto w-full flex items-center justify-center">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              {t.caseSubmittedTitle}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              {t.caseSubmittedSubtitle}
            </p>
          </div>

          {/* Credentials Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-left">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                {t.trackingCodeLabel}
              </span>
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-300/80 shadow-xs">
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-teal-800 tracking-wider">
                  {successData.trackingCode}
                </span>
                <button
                  onClick={() => copyToClipboard(successData.trackingCode, 'code')}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-200 cursor-pointer transition-colors"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? t.copySuccess : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                {t.accessPinLabel}
              </span>
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-300/80 shadow-xs">
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-slate-800 tracking-widest">
                  {successData.accessPin}
                </span>
                <button
                  onClick={() => copyToClipboard(successData.accessPin, 'pin')}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 cursor-pointer transition-colors"
                >
                  {copiedPin ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPin ? t.copySuccess : 'Copiar'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Important Security Notice */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs text-left leading-relaxed flex gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>{t.saveCredentialsWarning}</p>
          </div>

          <div className="pt-2">
            <Link
              href={`/track?code=${encodeURIComponent(successData.trackingCode)}&pin=${encodeURIComponent(successData.accessPin)}`}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-md shadow-teal-700/25 transition-all cursor-pointer"
            >
              <span>{t.btnGoToTrack}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-100/80 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Acolhimento Seguro</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.newCaseTitle}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
          {t.newCaseSubtitle}
        </p>
      </div>

      {/* Privacy reminder alert */}
      <div className="mb-6 p-4 rounded-2xl bg-teal-50/80 border border-teal-200 text-teal-950 text-xs sm:text-sm leading-relaxed flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5">Dica de Privacidade:</strong>
          {t.privacyReminder}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6"
      >
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Category Choice */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
            {t.categoryLabel}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { id: 'SOCIAL_SUPPORT' as const, label: t.categorySocialSupport, icon: HelpCircle },
              { id: 'COMPLAINT' as const, label: t.categoryComplaint, icon: MessageSquareWarning },
              { id: 'GRIEVANCE' as const, label: t.categoryGrievance, icon: ShieldAlert },
              { id: 'SUGGESTION' as const, label: t.categorySuggestion, icon: Sparkles },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/70 text-teal-950 font-semibold ring-1 ring-teal-600 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-teal-700' : 'text-slate-400'}`} />
                  <span className="text-xs leading-snug">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Choice */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
            {t.priorityLabel}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'LOW' as const, label: t.priorityLow, color: 'text-slate-700' },
              { id: 'MEDIUM' as const, label: t.priorityMedium, color: 'text-blue-700' },
              { id: 'HIGH' as const, label: t.priorityHigh, color: 'text-amber-700' },
              { id: 'URGENT' as const, label: t.priorityUrgent, color: 'text-rose-700' },
            ].map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => setPriority(p.id)}
                className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                  priority === p.id
                    ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold ring-1 ring-teal-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title / Summary */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
            {t.titleLabel} *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.titlePlaceholder}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 placeholder:text-slate-400"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
            {t.descriptionLabel} *
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descriptionPlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 placeholder:text-slate-400 resize-y leading-relaxed"
          />
        </div>

        {/* Voluntary Identification Collapsible Section */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="voluntaryToggle"
              checked={!isAnonymous}
              onChange={(e) => setIsAnonymous(!e.target.checked)}
              className="mt-1 h-4 w-4 rounded-md border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="voluntaryToggle" className="cursor-pointer">
              <span className="block text-xs font-bold text-slate-800">
                {t.voluntaryIdentifyToggle}
              </span>
              <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed">
                {t.voluntaryIdentifyDesc}
              </span>
            </label>
          </div>

          {!isAnonymous && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.contactNameLabel}
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ex: Maria Machava"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.contactChannelLabel}
                </label>
                <input
                  type="text"
                  value={contactChannel}
                  onChange={(e) => setContactChannel(e.target.value)}
                  placeholder="Ex: (+258) 84 123 4567 ou email@exemplo.mz"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-semibold text-sm sm:text-base shadow-md shadow-teal-700/20 hover:shadow-teal-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-teal-200" />
            <span>{isSubmitting ? t.submitting : t.btnSubmit}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
