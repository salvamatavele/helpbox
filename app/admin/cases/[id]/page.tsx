'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import {
  ArrowLeft,
  ShieldCheck,
  Send,
  Lock,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  User,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CaseDisplay } from '@/lib/services/case-service';
import { NotificationBell } from '@/components/admin/notification-bell';

export default function CaseDetailsPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [caseData, setCaseData] = useState<CaseDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status and assignment state
  const [status, setStatus] = useState<string>('');
  const [assignedToName, setAssignedToName] = useState<string>('');
  const [departmentName, setDepartmentName] = useState<string>('');
  const [isUpdatingMeta, setIsUpdatingMeta] = useState(false);

  // Message composer tabs: 'PUBLIC_REPLY' | 'INTERNAL_NOTE'
  const [activeTab, setActiveTab] = useState<'PUBLIC_REPLY' | 'INTERNAL_NOTE'>('PUBLIC_REPLY');
  const [replyText, setReplyText] = useState('');
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const loadCaseAndAuth = useCallback(async () => {
    try {
      const authRes = await fetch('/api/admin/auth');
      const authData = await authRes.json();
      if (!authRes.ok || !authData.authenticated) {
        router.push('/admin/login');
        return;
      }

      const res = await fetch(`/api/admin/cases/${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Caso não encontrado');
      }

      setCaseData(data);
      setStatus(data.status);
      setAssignedToName(data.assignedToName || authData.user.name);
      setDepartmentName(data.departmentName || 'Apoio Psicossocial & Triagem Geral');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar caso.';
      alert(message);
      router.push('/admin/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (id) void loadCaseAndAuth();
  }, [id, loadCaseAndAuth]);

  const handleUpdateStatusAndAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingMeta(true);
    setFeedbackMessage('');

    try {
      const res = await fetch(`/api/admin/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assignedToName: assignedToName.trim(),
          departmentName: departmentName.trim(),
        }),
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.error || 'Falha ao atualizar');
      }

      setCaseData(updated);
      setFeedbackMessage('Dados do processo atualizados com sucesso!');
      setTimeout(() => setFeedbackMessage(''), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar dados';
      alert(message);
    } finally {
      setIsUpdatingMeta(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmittingMessage(true);
    setFeedbackMessage('');

    const isInternalNote = activeTab === 'INTERNAL_NOTE';

    try {
      const res = await fetch(`/api/admin/cases/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyText.trim(),
          isInternalNote,
        }),
      });

      const updated = await res.json();
      if (!res.ok) {
        throw new Error(updated.error || 'Falha ao enviar mensagem');
      }

      setCaseData(updated);
      setReplyText('');
      setFeedbackMessage(
        isInternalNote
          ? 'Nota técnica interna registada em sigilo.'
          : 'Resposta oficial enviada com sucesso ao utente!'
      );
      setTimeout(() => setFeedbackMessage(''), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      alert(message);
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  if (isLoading || !caseData) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mr-2" />
        <span>A carregar processo...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-6">
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Painel</span>
        </Link>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <span className="text-xs font-mono font-bold bg-teal-50 border border-teal-200 text-teal-800 px-2.5 py-1 rounded-lg">
            {caseData.trackingCode}
          </span>
          <span className="text-xs text-slate-400">
            Registo: {formatDate(caseData.createdAt, language)}
          </span>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Main Grid: Details & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Case Information and Conversation Thread */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Relato Box */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                {caseData.category}
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">
                {caseData.title}
              </h1>
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                Relato do Utente:
              </span>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70 whitespace-pre-wrap">
                {caseData.description}
              </p>
            </div>

            {/* Identification info */}
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex flex-wrap gap-4">
              <div>
                <span className="font-semibold block text-slate-500">Identificação:</span>
                <span>{caseData.isAnonymous ? 'Anónimo (Zero identificadores)' : 'Voluntária'}</span>
              </div>
              {!caseData.isAnonymous && (
                <>
                  <div>
                    <span className="font-semibold block text-slate-500">Nome:</span>
                    <span>{caseData.contactName || 'Não especificado'}</span>
                  </div>
                  <div>
                    <span className="font-semibold block text-slate-500">Contacto:</span>
                    <span>{caseData.contactChannel || 'Não especificado'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Messages & Timeline History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Histórico de Atendimento e Mensagens</span>
              <span className="text-xs font-normal text-slate-400">
                {caseData.messages.length} registos
              </span>
            </h2>

            <div className="space-y-4">
              {caseData.messages.map((msg) => {
                const isInternal = msg.isInternalNote;
                const isCitizen = msg.senderType === 'CITIZEN';

                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                      isInternal
                        ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                        : isCitizen
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950 sm:mr-8'
                        : 'bg-teal-50/80 border-teal-200 text-teal-950 sm:ml-8'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5 opacity-90">
                      <div className="flex items-center gap-1.5">
                        {isInternal ? (
                          <>
                            <Lock className="w-3.5 h-3.5 text-amber-700" />
                            <span className="text-amber-900 font-bold uppercase tracking-wider text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded">
                              Nota Interna Confidencial
                            </span>
                          </>
                        ) : isCitizen ? (
                          <span>Utente</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                            {msg.senderName || 'Assistente Social'}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-normal text-slate-500">
                        {formatDate(msg.createdAt, language)}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                );
              })}
            </div>

            {/* Message composer with tabs */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('PUBLIC_REPLY')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'PUBLIC_REPLY'
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Resposta Oficial ao Utente
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('INTERNAL_NOTE')}
                  className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'INTERNAL_NOTE'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>Nota Interna (Apenas Equipa)</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500">
                {activeTab === 'PUBLIC_REPLY'
                  ? 'Esta mensagem será visível pelo utente ao consultar o caso com o código de rastreio.'
                  : 'Esta anotação é estritamente restrita à equipa técnica. O utente NÃO tem visibilidade.'}
              </p>

              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    activeTab === 'PUBLIC_REPLY'
                      ? t.officialReplyPlaceholder
                      : t.internalNotePlaceholder
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 placeholder:text-slate-400 resize-y"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingMessage}
                    className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer ${
                      activeTab === 'PUBLIC_REPLY'
                        ? 'bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400'
                        : 'bg-amber-700 hover:bg-amber-800 disabled:bg-amber-400'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {isSubmittingMessage
                        ? 'A registar...'
                        : activeTab === 'PUBLIC_REPLY'
                        ? t.btnSendOfficialReply
                        : t.btnAddInternalNote}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Management Controls */}
        <div className="space-y-6">
          <form
            onSubmit={handleUpdateStatusAndAssignment}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5"
          >
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider pb-2 border-b border-slate-100">
              Ações de Triagem & Encaminhamento
            </h3>

            {/* Status Select */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Estado do Processo
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="SUBMITTED">Novo (Aguardando Triagem)</option>
                <option value="IN_TRIAGE">Em Triagem</option>
                <option value="IN_PROGRESS">Em Atendimento Ativo</option>
                <option value="WAITING_INFO">Aguardando Informação do Utente</option>
                <option value="REFERRED">Encaminhado para Especialista</option>
                <option value="RESOLVED">Resolvido</option>
                <option value="CLOSED">Encerrado</option>
              </select>
            </div>

            {/* Caseworker Assignment */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Técnico / Assistente Responsável
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={assignedToName}
                  onChange={(e) => setAssignedToName(e.target.value)}
                  placeholder="Nome do assistente social"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            {/* Department Forwarding */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Departamento / Domínio
              </label>
              <select
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-900 focus:outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="Apoio Psicossocial & Triagem Geral">Apoio Psicossocial & Triagem Geral</option>
                <option value="Ouvidoria & Denúncias">Ouvidoria & Denúncias</option>
                <option value="Proteção da Família e Vulneráveis">Proteção da Família e Vulneráveis</option>
                <option value="Apoio Jurídico & Direitos Humanos">Apoio Jurídico & Direitos Humanos</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isUpdatingMeta}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isUpdatingMeta ? 'A guardar...' : t.btnSaveUpdates}</span>
            </button>
          </form>

          {/* Quick Guidance Box for Social Workers */}
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-3xl p-5 text-xs text-teal-950 space-y-2 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-teal-900">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Princípios de Atendimento Social</span>
            </div>
            <p>
              • Responda com linguagem clara, acolhedora e desprovida de jargões técnicos intimidantes.
            </p>
            <p>
              • Respeite a decisão de anonimato do utente; não exija dados pessoais para prestar orientação inicial.
            </p>
            <p>
              • Se a situação envolver risco físico iminente, indique os canais diretos e urgentes de assistência física.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
