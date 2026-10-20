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
  Building,
  ArrowRightLeft,
  AlertCircle,
  X,
  CheckCheck,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CaseDisplay } from '@/lib/services/case-service';
import { NotificationBell } from '@/components/admin/notification-bell';

interface DepartmentMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface DepartmentOption {
  id: string;
  name: string;
  description: string | null;
  members: DepartmentMember[];
}

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

  // Referral Modal state
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [showReferModal, setShowReferModal] = useState(false);
  const [targetDeptId, setTargetDeptId] = useState('');
  const [targetMemberId, setTargetMemberId] = useState('');
  const [referralPriority, setReferralPriority] = useState('');
  const [referralReason, setReferralReason] = useState('');
  const [isReferring, setIsReferring] = useState(false);

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

      // Load available departments with team members
      const deptRes = await fetch('/api/admin/departments');
      if (deptRes.ok) {
        const depts = await deptRes.json();
        setDepartments(depts);
      }
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

  const handleReferCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDeptId) {
      alert('Por favor, selecione o departamento de destino.');
      return;
    }
    if (!referralReason.trim() || referralReason.trim().length < 5) {
      alert('Por favor, forneça uma justificação técnica detalhada para o encaminhamento (mínimo 5 caracteres).');
      return;
    }

    setIsReferring(true);
    try {
      const res = await fetch(`/api/admin/cases/${id}/refer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: targetDeptId,
          assignedToId: targetMemberId || null,
          reason: referralReason.trim(),
          priority: referralPriority || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao processar encaminhamento');
      }

      setCaseData(data.case);
      setStatus(data.case.status);
      setAssignedToName(data.case.assignedToName || '');
      setDepartmentName(data.case.departmentName || '');
      setShowReferModal(false);
      setReferralReason('');
      setTargetMemberId('');
      setFeedbackMessage(
        `Processo encaminhado com sucesso para ${data.case.departmentName || 'o novo departamento'}!`
      );
      setTimeout(() => setFeedbackMessage(''), 4500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao encaminhar processo.';
      alert(message);
    } finally {
      setIsReferring(false);
    }
  };

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
    <div className="flex-1 py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-6 animate-fade-in-up">
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
            <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  {caseData.category}
                </span>
                <h1 className="text-xl font-bold text-slate-900 mt-1">
                  {caseData.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  <Building className="w-3.5 h-3.5 text-teal-600" />
                  <span>{caseData.departmentName || 'Triagem Geral'}</span>
                </span>
                {caseData.assignedToName && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>{caseData.assignedToName}</span>
                  </span>
                )}
              </div>
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

            {/* Telegram-style conversation wallpaper */}
            <div className="telegram-wallpaper p-4 sm:p-5 rounded-2xl border border-slate-200/90 max-h-[520px] overflow-y-auto space-y-3.5">
              <div className="flex justify-center">
                <span className="telegram-bubble-system px-3 py-1 text-slate-500 font-medium border border-slate-200/60">
                  Canal Oficial de Atendimento Helpbox • {formatDate(caseData.createdAt, language)}
                </span>
              </div>

              {caseData.messages.map((msg) => {
                const isInternal = msg.isInternalNote;
                const isCitizen = msg.senderType === 'CITIZEN';
                const isReferral = isInternal && msg.message.startsWith('[ENCAMINHAMENTO TÉCNICO]');

                if (isReferral) {
                  return (
                    <div key={msg.id} className="p-3.5 rounded-2xl bg-indigo-50/95 border border-indigo-200 text-indigo-950 text-xs sm:text-sm shadow-2xs">
                      <div className="flex items-center justify-between font-semibold mb-1 text-indigo-800">
                        <span className="flex items-center gap-1.5">
                          <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-200/80 px-2 py-0.5 rounded-full">
                            Encaminhamento Técnico
                          </span>
                        </span>
                        <span className="text-[10px] font-normal text-indigo-600">
                          {formatDate(msg.createdAt, language)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap font-medium">{msg.message}</p>
                    </div>
                  );
                }

                if (isInternal) {
                  return (
                    <div key={msg.id} className="p-3.5 rounded-2xl bg-amber-50/95 border border-amber-200 text-amber-950 text-xs sm:text-sm shadow-2xs">
                      <div className="flex items-center justify-between font-semibold mb-1 text-amber-800">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 px-2 py-0.5 rounded-full">
                            Nota Interna Restrita
                          </span>
                        </span>
                        <span className="text-[10px] font-normal text-amber-600">
                          {formatDate(msg.createdAt, language)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  );
                }

                if (isCitizen) {
                  // Utente incoming message
                  return (
                    <div key={msg.id} className="flex flex-col items-start">
                      <div className="telegram-bubble-in p-3.5 sm:p-4 max-w-[90%] sm:max-w-[78%] leading-relaxed text-xs sm:text-sm">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            <span>Utente ({caseData.isAnonymous ? 'Anónimo' : 'Identificado'})</span>
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-slate-800">{msg.message}</p>
                        <div className="flex items-center justify-end mt-1 text-[10px] text-slate-400">
                          <span>{formatDate(msg.createdAt, language)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Official Caseworker Reply (Outgoing to citizen)
                return (
                  <div key={msg.id} className="flex flex-col items-end">
                    <div className="telegram-bubble-out p-3.5 sm:p-4 max-w-[90%] sm:max-w-[78%] leading-relaxed text-xs sm:text-sm shadow-xs">
                      <div className="flex items-center justify-between text-xs font-bold text-sky-950 mb-1">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-sky-700" />
                          <span>{msg.senderName || 'Assistência Social'}</span>
                        </span>
                      </div>
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
          {/* Active Department & Interdepartmental Referral Action */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Alocação do Processo</span>
              <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-full">
                Serviço Social
              </span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Departamento Responsável:
                </span>
                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{caseData.departmentName || 'Triagem Geral & Acolhimento'}</span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Técnico / Especialista Atribuído:
                </span>
                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>{caseData.assignedToName || 'Equipa Geral do Departamento'}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setTargetDeptId(caseData.departmentId || (departments[0]?.id || ''));
                setReferralPriority(caseData.priority);
                setShowReferModal(true);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Encaminhar para Outro Departamento</span>
            </button>
          </div>

          {/* Quick Status Updater */}
          <form
            onSubmit={handleUpdateStatusAndAssignment}
            className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4"
          >
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider pb-2 border-b border-slate-100">
              Estado do Atendimento
            </h3>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Fase do Processo
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

            <button
              type="submit"
              disabled={isUpdatingMeta}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>{isUpdatingMeta ? 'A guardar...' : 'Atualizar Estado'}</span>
            </button>
          </form>

          {/* Referral Modal */}
          {showReferModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                      <ArrowRightLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        Encaminhamento Interdepartamental
                      </h3>
                      <p className="text-xs text-slate-500">
                        Processo: <span className="font-mono font-bold text-teal-800">{caseData.trackingCode}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowReferModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3.5 bg-indigo-50/80 border border-indigo-100 rounded-2xl text-xs text-indigo-950 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Esta ação transfere a competência técnica do caso para o departamento selecionado e regista automaticamente uma nota técnica confidencial com o parecer de encaminhamento no histórico.
                  </p>
                </div>

                <form onSubmit={handleReferCase} className="space-y-4 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      Departamento de Destino *
                    </label>
                    <select
                      value={targetDeptId}
                      onChange={(e) => {
                        setTargetDeptId(e.target.value);
                        setTargetMemberId('');
                      }}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                    >
                      <option value="">Selecione o departamento destinatário...</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {targetDeptId && departments.find((d) => d.id === targetDeptId)?.description && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">
                        {departments.find((d) => d.id === targetDeptId)?.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      Técnico / Especialista no Destino (Opcional)
                    </label>
                    <select
                      value={targetMemberId}
                      onChange={(e) => setTargetMemberId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                    >
                      <option value="">Equipa Geral do Departamento (Triagem Inicial)</option>
                      {departments
                        .find((d) => d.id === targetDeptId)
                        ?.members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} ({member.role})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      Prioridade de Transferência
                    </label>
                    <select
                      value={referralPriority}
                      onChange={(e) => setReferralPriority(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                    >
                      <option value="">Manter prioridade atual ({caseData.priority})</option>
                      <option value="URGENT">Urgente</option>
                      <option value="HIGH">Alta</option>
                      <option value="MEDIUM">Média</option>
                      <option value="LOW">Normal / Baixa</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700">
                      Parecer Técnico / Motivo do Encaminhamento *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={referralReason}
                      onChange={(e) => setReferralReason(e.target.value)}
                      placeholder="Descreva a fundamentação técnica da transferência, histórico relevante ou diligências recomendadas ao departamento de destino..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 resize-none text-xs sm:text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowReferModal(false)}
                      disabled={isReferring}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isReferring}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>{isReferring ? 'A processar...' : 'Confirmar Encaminhamento'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
