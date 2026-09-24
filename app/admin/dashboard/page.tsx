'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { NotificationBell } from '@/components/admin/notification-bell';
import {
  LogOut,
  ArrowUpRight,
  RefreshCw,
  Search,
  Building,
  Users,
  User,
  FileText,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { CaseDisplay } from '@/lib/services/case-service';
import { StaffSessionUser } from '@/lib/services/auth-service';

export default function AdminDashboardPage() {
  const { t, language } = useTranslation();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<StaffSessionUser | null>(null);
  const [cases, setCases] = useState<CaseDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const checkAuthAndLoadData = useCallback(async () => {
    try {
      const authRes = await fetch('/api/admin/auth');
      const authData = await authRes.json();
      if (!authRes.ok || !authData.authenticated) {
        router.push('/admin/login');
        return;
      }
      setCurrentUser(authData.user);

      // Load cases
      const casesRes = await fetch('/api/cases');
      const casesData = await casesRes.json();
      if (casesRes.ok) {
        setCases(casesData);
      }
    } catch (err: unknown) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void checkAuthAndLoadData();

    const refreshCases = () => {
      fetch('/api/cases')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setCases(data);
        })
        .catch(() => {});
    };

    // Auto-refresh cases every 15 seconds to sync with notifications
    const interval = setInterval(refreshCases, 15000);

    // Instant refresh whenever a real-time notification arrives
    window.addEventListener('backoffice:notification', refreshCases);

    return () => {
      clearInterval(interval);
      window.removeEventListener('backoffice:notification', refreshCases);
    };
  }, [checkAuthAndLoadData]);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const filteredCases = cases.filter((c) => {
    const matchesFilter =
      filterStatus === 'ALL' || c.status === filterStatus;
    const matchesQuery =
      searchQuery === '' ||
      c.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const countTotal = cases.length;
  const countNew = cases.filter((c) => c.status === 'SUBMITTED').length;
  const countInProgress = cases.filter(
    (c) => c.status === 'IN_TRIAGE' || c.status === 'IN_PROGRESS' || c.status === 'WAITING_INFO'
  ).length;
  const countResolved = cases.filter(
    (c) => c.status === 'RESOLVED' || c.status === 'CLOSED'
  ).length;

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Urgente</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">Alta</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200">Média</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">Normal</span>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">Novo</span>;
      case 'IN_TRIAGE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">Em Triagem</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">Em Atendimento</span>;
      case 'WAITING_INFO':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">Aguardando Resposta</span>;
      case 'REFERRED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">Encaminhado</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Resolvido</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Encerrado</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs">{s}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-600 mr-2" />
        <span>A carregar painel de assistência social...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Bar with user profile and notification bell */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-base sm:text-lg">
                {currentUser?.name}
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser?.departmentName || 'Serviço Social & Triagem'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Notification Bell */}
          <NotificationBell />

          <button
            onClick={() => void checkAuthAndLoadData()}
            title="Atualizar lista"
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            title="Terminar sessão"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-teal-50 text-teal-900">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Processos & Casos</span>
          </span>
          {currentUser?.role === 'ADMIN' && (
            <Link
              href="/admin/users"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Gestão da Equipa</span>
            </Link>
          )}
          <Link
            href="/admin/profile"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>Meu Perfil & Senha</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            {t.statTotalCases}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {countTotal}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1 flex items-center justify-between">
            <span>{t.statNewCases}</span>
            {countNew > 0 && <span className="animate-pulse w-2 h-2 rounded-full bg-amber-500" />}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-900">
            {countNew}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-teal-200 bg-teal-50/20 shadow-xs">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
            {t.statInTriage}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-teal-900">
            {countInProgress}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
            {t.statResolved}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900">
            {countResolved}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por código, título ou relato..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-teal-600"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'ALL', label: t.filterAll },
            { id: 'SUBMITTED', label: 'Novos' },
            { id: 'IN_PROGRESS', label: 'Em Atendimento' },
            { id: 'RESOLVED', label: 'Resolvidos' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === f.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Código / Data</th>
                <th className="py-3.5 px-4">Situação / Título</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Urgência</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Responsável</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    Nenhum caso encontrado para este critério.
                  </td>
                </tr>
              ) : (
                filteredCases.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <span className="font-mono font-bold text-teal-800 block">
                        {item.trackingCode}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(item.createdAt, language)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-semibold text-slate-900 block truncate">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {item.description}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                      {item.category}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getPriorityBadge(item.priority)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                      {item.assignedToName ? (
                        <span className="font-medium text-slate-800">{item.assignedToName}</span>
                      ) : (
                        <span className="text-slate-400 italic">Não atribuído</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/cases/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span>{t.btnViewDetails}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
