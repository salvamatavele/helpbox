'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import {
  Users,
  UserPlus,
  KeyRound,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building,
  RefreshCw,
  X,
  FileText,
  User,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { UserSummary } from '@/lib/services/user-service';
import { NotificationBell } from '@/components/admin/notification-bell';

export default function AdminUsersPage() {
  const { language } = useTranslation();
  const router = useRouter();

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'SOCIAL_WORKER' | 'ADMIN' | 'SPECIALIST'>('SOCIAL_WORKER');
  const [departmentId, setDepartmentId] = useState('');
  const [password, setPassword] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error(data.error || 'Falha ao carregar utilizadores.');
      }
      setUsers(data.users || []);
      setDepartments(data.departments || []);
      setCurrentUserRole(data.currentUserRole || '');
      if (data.departments?.length > 0 && !departmentId) {
        setDepartmentId(data.departments[0].id);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar equipa.';
      setFeedback({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  }, [router, departmentId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
          departmentId: departmentId || undefined,
          password: password.trim() || 'admin123',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao criar utilizador.');
      }

      setFeedback({
        type: 'success',
        message: `Utilizador ${name} registado com sucesso com a palavra-passe padrão: ${password.trim() || 'admin123'}`,
      });
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('admin123');
      void loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao registar utilizador.';
      setFeedback({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    if (!confirm(`Deseja redefinir a palavra-passe de "${userName}" para o padrão "admin123"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_PASSWORD' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao redefinir palavra-passe.');
      }

      setFeedback({
        type: 'success',
        message: `Palavra-passe de ${userName} redefinida com sucesso para: admin123`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro na redefinição.';
      setFeedback({ type: 'error', message });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem a certeza de que deseja remover permanentemente o utilizador "${userName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao eliminar.');
      }

      setFeedback({
        type: 'success',
        message: `Utilizador ${userName} removido com sucesso.`,
      });
      void loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao eliminar utilizador.';
      setFeedback({ type: 'error', message });
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'ADMIN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">Administrador</span>;
      case 'SOCIAL_WORKER':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-900 border border-teal-200">Assistente Social</span>;
      case 'SPECIALIST':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-900 border border-blue-200">Especialista</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs">{r}</span>;
    }
  };

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
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
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-teal-50 text-teal-900">
            <Users className="w-4 h-4 text-teal-600" />
            <span>Gestão da Equipa</span>
          </span>
          <Link
            href="/admin/profile"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>Meu Perfil & Senha</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registar Utilizador</span>
          </button>
        </div>
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

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Membros da Equipa e Técnicos de Apoio
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Administração de acessos, papéis de serviço social e redefinição de palavras-passe.
            </p>
          </div>
          <button
            onClick={() => void loadData()}
            title="Atualizar lista"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Nome / Email</th>
                <th className="py-3.5 px-4">Função / Papel</th>
                <th className="py-3.5 px-4">Departamento</th>
                <th className="py-3.5 px-4">Data de Registo</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                    {isLoading ? 'A carregar membros da equipa...' : 'Nenhum utilizador encontrado.'}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-xs text-slate-500 font-mono">{u.email}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 flex items-center gap-1.5 pt-4">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.departmentName || 'Geral'}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-xs">
                      {formatDate(u.createdAt, language)}
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleResetPassword(u.id, u.name)}
                          title="Redefinir palavra-passe para admin123"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                          <span>Reset (admin123)</span>
                        </button>

                        {currentUserRole === 'ADMIN' && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            title="Eliminar utilizador"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criação de Utilizador */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Registar Novo Membro na Equipa
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wide text-xs">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Mondlane"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wide text-xs">
                  Email de Trabalho *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="carlos.mondlane@helpbox.mz"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wide text-xs">
                    Função / Papel *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'ADMIN' | 'SOCIAL_WORKER' | 'SPECIALIST')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-teal-600 cursor-pointer"
                  >
                    <option value="SOCIAL_WORKER">Assistente Social</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="SPECIALIST">Especialista</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 uppercase tracking-wide text-xs">
                    Departamento
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-teal-600 cursor-pointer"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wide text-xs">
                  Palavra-passe Inicial
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-teal-600"
                />
                <span className="text-[11px] text-slate-500 block">
                  Por padrão sugerimos <code className="font-bold text-teal-800">admin123</code>. O utilizador poderá alterar no seu perfil.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-semibold shadow-xs cursor-pointer"
                >
                  {isSubmitting ? 'A registar...' : 'Criar Utilizador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
