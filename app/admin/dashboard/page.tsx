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
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'MY_DEPARTMENT' | 'ASSIGNED_TO_ME'>('ALL');
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
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.departmentName && c.departmentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.assignedToName && c.assignedToName.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesScope = true;
    if (scopeFilter === 'MY_DEPARTMENT') {
      matchesScope = Boolean(
        (currentUser?.departmentId && c.departmentId === currentUser.departmentId) ||
        (currentUser?.departmentName && c.departmentName?.toLowerCase() === currentUser.departmentName?.toLowerCase())
      );
    } else if (scopeFilter === 'ASSIGNED_TO_ME') {
      matchesScope = Boolean(
        (currentUser?.id && c.assignedToId === currentUser.id) ||
        (currentUser?.name && c.assignedToName?.toLowerCase() === currentUser.name?.toLowerCase())
      );
    }

    return matchesFilter && matchesQuery && matchesScope;
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
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">{t.priorityUrgent}</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">{t.priorityHigh}</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200">{t.priorityMedium}</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">{t.priorityLow}</span>;
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">{t.statusSubmitted}</span>;
      case 'IN_TRIAGE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">{t.statusInTriage}</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">{t.statusInProgress}</span>;
      case 'WAITING_INFO':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">{t.statusWaitingInfo}</span>;
      case 'REFERRED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">{t.statusReferred}</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">{t.statusResolved}</span>;
      case 'CLOSED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{t.statusClosed}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs">{s}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-slate-500 animate-fade-in-up">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-700 mr-2.5" />
        <span className="font-medium text-sm">{t.loadingDashboard}</span>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6 animate-fade-in-up">
      {/* Top Bar with user profile and notification bell */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-teal-900/10 shadow-calm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-800 to-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-base sm:text-lg">
                {currentUser?.name}
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200/60">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Building className="w-3.5 h-3.5 text-teal-700" />
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
            className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            title={t.btnLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-semibold text-slate-600 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.btnLogout}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-teal-50 text-teal-900 border border-teal-200/60">
            <FileText className="w-4 h-4 text-teal-700" />
            <span>{t.dashboardTitle}</span>
          </span>
          {currentUser?.role === 'ADMIN' && (
            <Link
              href="/admin/users"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>{t.navTeamManagement}</span>
            </Link>
          )}
          <Link
            href="/admin/profile"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>{t.navMyProfile}</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-interactive bg-white p-5 rounded-2xl shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            {t.statTotalCases}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {countTotal}
          </span>
        </div>

        <div className="card-interactive bg-white p-5 rounded-2xl border-amber-200/80 bg-amber-50/20 shadow-xs">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1 flex items-center justify-between">
            <span>{t.statNewCases}</span>
            {countNew > 0 && <span className="animate-ping w-2 h-2 rounded-full bg-amber-500" />}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-900">
            {countNew}
          </span>
        </div>

        <div className="card-interactive bg-white p-5 rounded-2xl border-teal-200/80 bg-teal-50/20 shadow-xs">
          <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-1">
            {t.statInTriage}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-teal-900">
            {countInProgress}
          </span>
        </div>

        <div className="card-interactive bg-white p-5 rounded-2xl border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
            {t.statResolved}
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900">
            {countResolved}
          </span>
        </div>
      </div>

      {/* Scope Filters: Todos | Meu Departamento | Atribuídos a Mim */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setScopeFilter('ALL')}
          className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
            scopeFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t.scopeAll}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            scopeFilter === 'ALL' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {cases.length}
          </span>
        </button>

        <button
          onClick={() => setScopeFilter('MY_DEPARTMENT')}
          className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
            scopeFilter === 'MY_DEPARTMENT'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90'
          }`}
        >
          <Building className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t.scopeMyDepartment}</span>
          {currentUser?.departmentName && (
            <span className="hidden md:inline text-[11px] font-normal opacity-90">
              ({currentUser.departmentName})
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            scopeFilter === 'MY_DEPARTMENT' ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {
              cases.filter((c) =>
                Boolean(
                  (currentUser?.departmentId && c.departmentId === currentUser.departmentId) ||
                  (currentUser?.departmentName && c.departmentName?.toLowerCase() === currentUser.departmentName?.toLowerCase())
                )
              ).length
            }
          </span>
        </button>

        <button
          onClick={() => setScopeFilter('ASSIGNED_TO_ME')}
          className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
            scopeFilter === 'ASSIGNED_TO_ME'
              ? 'bg-teal-800 text-white shadow-xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90'
          }`}
        >
          <User className="w-3.5 h-3.5 text-teal-400" />
          <span>{t.scopeAssignedToMe}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            scopeFilter === 'ASSIGNED_TO_ME' ? 'bg-teal-900 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {
              cases.filter((c) =>
                Boolean(
                  (currentUser?.id && c.assignedToId === currentUser.id) ||
                  (currentUser?.name && c.assignedToName?.toLowerCase() === currentUser.name?.toLowerCase())
                )
              ).length
            }
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-teal-900/10 shadow-calm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchCasesPlaceholder}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/25 focus:border-teal-700 placeholder:text-slate-400 transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'ALL', label: t.filterAll },
            { id: 'SUBMITTED', label: t.filterSubmitted },
            { id: 'IN_PROGRESS', label: t.filterInProgress },
            { id: 'REFERRED', label: t.filterReferred },
            { id: 'RESOLVED', label: t.filterResolved },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                filterStatus === f.id
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cases List: Telegram Chat Feed on Mobile/Tablet & Table on Desktop */}
      <div className="bg-white rounded-3xl border border-teal-900/10 shadow-calm overflow-hidden">
        {/* Telegram Chat Feed for Mobile & Compact Screens */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredCases.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              {t.noCasesFound}
            </div>
          ) : (
            filteredCases.map((item) => (
              <Link
                key={item.id}
                href={`/admin/cases/${item.id}`}
                className="p-4 flex items-start gap-3 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer group"
              >
                <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-[#2481cc] to-teal-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  {item.title.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-bold text-slate-900 text-sm truncate group-hover:text-[#2481cc] transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {formatDate(item.createdAt, language)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-1.5">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-sky-50 text-[#2481cc] font-semibold border border-sky-100">
                      {item.trackingCode}
                    </span>
                    {getStatusBadge(item.status)}
                    {getPriorityBadge(item.priority)}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">{t.colCodeDate}</th>
                <th className="py-3.5 px-4">{t.colTitle}</th>
                <th className="py-3.5 px-4">{t.colCategory}</th>
                <th className="py-3.5 px-4">{t.colUrgency}</th>
                <th className="py-3.5 px-4">{t.colStatus}</th>
                <th className="py-3.5 px-4">{t.colDeptStaff}</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    {t.noCasesFound}
                  </td>
                </tr>
              ) : (
                filteredCases.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
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
                      {item.departmentName ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium text-[11px] border border-indigo-100 mb-1 block w-max">
                          <Building className="w-3 h-3 text-indigo-500" />
                          {item.departmentName}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] block italic mb-1">Geral</span>
                      )}
                      {item.assignedToName ? (
                        <span className="font-medium text-slate-800 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {item.assignedToName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">{t.unassigned}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/cases/${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold transition-all hover:scale-102 cursor-pointer border border-teal-200/50"
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
