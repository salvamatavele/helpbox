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
  Printer,
  Lock,
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

  const handlePrint = () => {
    window.print();
  };

  if (successData) {
    return (
      <div className="flex-1 py-12 px-4 sm:px-6 max-w-2xl mx-auto w-full flex items-center justify-center animate-fade-in-up">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-teal-900/10 shadow-calm-lg space-y-7 text-center">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto shadow-sm border border-teal-100 animate-pulse-glow">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.caseSubmittedTitle}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {t.caseSubmittedTitle}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
              {t.caseSubmittedSubtitle}
            </p>
          </div>

          {/* Credentials Box */}
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-4 text-left">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                {t.trackingCodeLabel}
              </span>
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-teal-800 tracking-wider">
                  {successData.trackingCode}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(successData.trackingCode, 'code')}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 cursor-pointer transition-all duration-150 active:scale-95"
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
              <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs">
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-slate-800 tracking-widest">
                  {successData.accessPin}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(successData.accessPin, 'pin')}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer transition-all duration-150 active:scale-95"
                >
                  {copiedPin ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPin ? t.copySuccess : 'Copiar'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Important Security Notice */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs text-left leading-relaxed flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>{t.saveCredentialsWarning}</p>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printSaveCredentials}</span>
            </button>

            <Link
              href={`/track?code=${encodeURIComponent(successData.trackingCode)}&pin=${encodeURIComponent(successData.accessPin)}`}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs sm:text-sm shadow-calm transition-all hover:-translate-y-0.5 cursor-pointer"
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
    <div className="flex-1 py-10 px-4 sm:px-6 max-w-3xl mx-auto w-full animate-fade-in-up">
      {/* Header */}
      <div className="mb-8 space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-900 bg-teal-100/80 px-3.5 py-1.5 rounded-full border border-teal-200/60 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-700" />
          <span>{t.confidentialIntakeBadge}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {t.newCaseTitle}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
          {t.newCaseSubtitle}
        </p>
      </div>

      {/* Privacy reminder alert */}
      <div className="mb-6 p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-teal-950 text-xs sm:text-sm leading-relaxed flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block mb-0.5 text-teal-900">{t.privacyReminderTitle}:</strong>
          {t.privacyReminder}
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-teal-900/10 shadow-calm space-y-6"
      >
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fade-in-up">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Anonymity Status Indicator */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>{t.anonymityActiveBadge}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {t.anonymityEncryptedDesc}
          </span>
        </div>

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
                  className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50/80 text-teal-950 font-semibold ring-1 ring-teal-700 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 transition-colors ${isSelected ? 'text-teal-800' : 'text-slate-400'}`} />
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
              { id: 'LOW' as const, label: t.priorityLow },
              { id: 'MEDIUM' as const, label: t.priorityMedium },
              { id: 'HIGH' as const, label: t.priorityHigh },
              { id: 'URGENT' as const, label: t.priorityUrgent },
            ].map((p) => {
              const isSelected = priority === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`px-3 py-2.5 text-xs rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-teal-700 bg-teal-800 text-white font-bold shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
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
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/25 focus:border-teal-700 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
              {t.descriptionLabel} *
            </label>
            <span className="text-[11px] text-slate-400">
              {t.writingComfortPrompt}
            </span>
          </div>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descriptionPlaceholder}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/25 focus:border-teal-700 placeholder:text-slate-400 resize-y leading-relaxed transition-all"
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
              className="mt-1 h-4 w-4 rounded-md border-slate-300 text-teal-700 focus:ring-teal-600 cursor-pointer"
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
            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in-up">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.contactNameLabel}
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ex: Maria Machava"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-700"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-700"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-teal-800 hover:bg-teal-900 disabled:bg-teal-400 text-white font-semibold text-sm sm:text-base shadow-calm hover:shadow-calm-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t.encryptingAndSubmitting}</span>
              </span>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-teal-200" />
                <span>{t.btnSubmit}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
