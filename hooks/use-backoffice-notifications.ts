'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { playNotificationSound } from '@/lib/audio';

export interface BackofficeNotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  caseId: string;
  trackingCode?: string;
  timestamp: string;
  isRead: boolean;
}

export function useBackofficeNotifications() {
  const [notifications, setNotifications] = useState<BackofficeNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const seenIdsRef = useRef<Set<string>>(new Set());

  // Check initial permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const requestBrowserPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setPermissionState(res);
        return res;
      } catch {
        return 'denied';
      }
    }
    return 'denied';
  }, []);

  // 1. Initial Load from Database & Helper
  const loadNotificationsFromDb = useCallback(async (isPolling = false) => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data.notifications)) return;

      const incoming: BackofficeNotificationItem[] = data.notifications;
      
      // Check if there are newly arrived unread notifications during poll
      if (isPolling) {
        let hasNewUnread = false;
        incoming.forEach((item) => {
          if (!item.isRead && !seenIdsRef.current.has(item.id)) {
            hasNewUnread = true;
          }
        });

        if (hasNewUnread) {
          playNotificationSound();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('backoffice:notification'));
          }
        }
      }

      // Track all seen IDs
      incoming.forEach((item) => seenIdsRef.current.add(item.id));

      setNotifications(incoming);
      setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : incoming.filter(n => !n.isRead).length);
    } catch (err) {
      console.warn('Erro ao carregar notificações do servidor:', err);
    }
  }, []);

  // 2. Initial load on mount
  useEffect(() => {
    void loadNotificationsFromDb(false);
  }, [loadNotificationsFromDb]);

  // 3. Real-Time SSE Stream with auto-reconnection
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/admin/notifications/stream');

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'CONNECTED') return;

            const notifId = data.id || `notif-${Date.now()}`;
            seenIdsRef.current.add(notifId);

            const newItem: BackofficeNotificationItem = {
              id: notifId,
              type: data.type || 'NOTIFICATION',
              title: data.title || 'Notificação',
              message: data.message || '',
              caseId: data.caseId || '',
              trackingCode: data.trackingCode,
              timestamp: data.timestamp || new Date().toISOString(),
              isRead: false,
            };

            setNotifications((prev) => {
              // Avoid duplicates
              if (prev.some((p) => p.id === newItem.id)) return prev;
              return [newItem, ...prev.slice(0, 29)];
            });
            setUnreadCount((c) => c + 1);

            // Play pleasant chime
            playNotificationSound();

            // Dispatch global event for pages (e.g. dashboard) to refresh data
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('backoffice:notification', { detail: newItem })
              );
            }

            // Native Browser Notification
            if (
              typeof window !== 'undefined' &&
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              try {
                new Notification(newItem.title, {
                  body: newItem.message,
                  icon: '/icons/icon.svg',
                });
              } catch {
                // Ignore background notification exceptions
              }
            }
          } catch (err) {
            console.warn('Erro ao processar evento de notificação:', err);
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource?.close();
          // Attempt reconnection after 5 seconds
          reconnectTimer = setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.warn('Falha ao instanciar EventSource:', err);
      }
    };

    connectSSE();

    // 4. Polling fallback every 15 seconds to ensure zero missed notifications
    const pollInterval = setInterval(() => {
      void loadNotificationsFromDb(true);
    }, 15000);

    return () => {
      eventSource?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(pollInterval);
    };
  }, [loadNotificationsFromDb]);

  const markAllAsRead = useCallback(async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    // Persist to server
    try {
      await fetch('/api/admin/notifications', { method: 'PATCH' });
    } catch (err) {
      console.warn('Erro ao atualizar estado de lido:', err);
    }
  }, []);

  const triggerTestNotification = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Notificação de Teste da Equipa',
          message: 'Canal em tempo real ativo. O som, indicador e alertas estão operacionais!',
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    permissionState,
    requestBrowserPermission,
    triggerTestNotification,
    markAllAsRead,
    refreshNotifications: loadNotificationsFromDb,
  };
}
