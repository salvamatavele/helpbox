'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Building,
  ShieldCheck,
  FileText,
  Users,
  Save,
} from 'lucide-react';
import { StaffSessionUser } from '@/lib/services/auth-service';
import { NotificationBell } from '@/components/admin/notification-bell';

export default function AdminProfilePage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<StaffSessionUser | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/profile');
      const data = await res.json();
      if (!res.ok || !data.user) {
        router.push('/admin/login');
        return;
      }
      setCurrentUser(data.user);
      setName(data.user.name || '');
      setEmail(data.user.email || '');
    } catch {
      router.push('/admin/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // If attempting to change password, validate matches
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setFeedback({ type: 'error', message: 'A nova palavra-passe e a confirmação não coincidem.' });
        return;
      }
      if (newPassword.length < 6) {
        setFeedback({ type: 'error', message: 'A nova palavra-passe deve ter pelo menos 6 caracteres.' });
        return;
      }
      if (!currentPassword) {
        setFeedback({ type: 'error', message: 'Por favor, insira a sua palavra-passe atual para autorizar a alteração.' });
        return;
      }
    }

    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao atualizar perfil.');
      }

      setFeedback({ type: 'success', message: 'Perfil e credenciais atualizados com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      void loadProfile();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao guardar alterações.';
      setFeedback({ type: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-slate-500">
        <span>A carregar perfil...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Processos & Casos</span>
          </Link>
          {currentUser?.role === 'ADMIN' && (
            <Link
              href="/admin/users"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Gestão da Equipa</span>
            </Link>
          )}
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-teal-50 text-teal-900">
            <User className="w-4 h-4 text-teal-600" />
            <span>Meu Perfil & Senha</span>
          </span>
        </div>

        <NotificationBell />
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
        {/* Profile Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{currentUser?.name}</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser?.departmentName || 'Serviço Social & Triagem'}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Personal Data */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Dados Pessoais e de Identificação</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Email Profissional
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Password Change */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-teal-600" />
                <span>Alterar Palavra-passe</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Preencha estes campos apenas se desejar modificar a sua palavra-passe de acesso.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Palavra-passe Atual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Nova Palavra-passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Confirmar Nova Palavra-passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'A guardar alterações...' : 'Guardar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
