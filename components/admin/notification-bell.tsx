'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/context';
import { useBackofficeNotifications } from '@/hooks/use-backoffice-notifications';
import { Bell, Volume2, CheckCheck, Inbox, Radio } from 'lucide-react';
import { playNotificationSound } from '@/lib/audio';

export function NotificationBell() {
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    isConnected,
    permissionState,
    requestBrowserPermission,
    triggerTestNotification,
    markAllAsRead,
  } = useBackofficeNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTestAlert = async () => {
    setIsTesting(true);
    await triggerTestNotification();
    setTimeout(() => setIsTesting(false), 2000);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        title="Notificações em tempo real"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-sm">
                {t.liveNotifications}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  isConnected
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
                title={isConnected ? t.notificationsActive : t.notificationsSyncing}
              >
                <Radio className={`w-2.5 h-2.5 ${isConnected ? 'animate-pulse' : ''}`} />
                {isConnected ? t.notificationsActive : t.notificationsSyncing}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => playNotificationSound()}
                title="Test sound"
                className="p-1.5 text-slate-400 hover:text-teal-600 rounded-lg transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title={t.markAsRead}
                  className="flex items-center gap-1 text-xs text-teal-700 hover:text-teal-900 font-medium px-2 py-1 rounded-md hover:bg-teal-50 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{t.clearAll}</span>
                </button>
              )}
            </div>
          </div>

          {/* Browser Desktop Notification Activation Banner */}
          {permissionState === 'default' && (
            <div className="p-2.5 bg-teal-50/70 border-b border-teal-100 flex items-center justify-between gap-2 text-xs">
              <span className="text-teal-900 font-medium">
                Ativar alertas no navegador?
              </span>
              <button
                onClick={() => void requestBrowserPermission()}
                className="px-2 py-0.5 rounded-lg bg-teal-700 text-white font-semibold text-[11px] hover:bg-teal-800 transition-colors cursor-pointer shrink-0"
              >
                Ativar
              </button>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Inbox className="w-8 h-8 stroke-1 text-slate-300" />
                <p>Nenhuma notificação registada no momento.</p>
                <p className="text-[11px] text-slate-400">
                  O painel escuta novas entradas e respostas automaticamente.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const Content = (
                  <div
                    className={`block p-3.5 hover:bg-teal-50/50 transition-colors text-left ${
                      !item.isRead ? 'bg-teal-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-900 line-clamp-1">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    {item.trackingCode && (
                      <span className="inline-block mt-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                        {item.trackingCode}
                      </span>
                    )}
                  </div>
                );

                return item.caseId ? (
                  <Link
                    key={item.id}
                    href={`/admin/cases/${item.caseId}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {Content}
                  </Link>
                ) : (
                  <div key={item.id}>{Content}</div>
                );
              })
            )}
          </div>

          {/* Test alert trigger footer */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Canal em tempo real ativo</span>
            <button
              onClick={() => void handleTestAlert()}
              disabled={isTesting}
              className="text-teal-700 hover:text-teal-900 font-medium hover:underline cursor-pointer disabled:opacity-50"
            >
              {isTesting ? 'A emitir teste...' : 'Testar alerta'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
