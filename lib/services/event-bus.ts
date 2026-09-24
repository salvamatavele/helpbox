import { EventEmitter } from 'events';
import { prisma } from '@/lib/prisma';

// Global singleton event emitter for real-time notification streaming (SSE)
const globalForEvents = globalThis as unknown as {
  notificationEmitter: EventEmitter | undefined;
};

export const notificationEmitter =
  globalForEvents.notificationEmitter ?? new EventEmitter();

// Allow unlimited listeners for connected backoffice clients
notificationEmitter.setMaxListeners(100);

// Always register in globalThis to guarantee single instance across Next.js chunks in production
globalForEvents.notificationEmitter = notificationEmitter;

export type RealtimeEvent = {
  id: string;
  type: 'NEW_CASE' | 'NEW_MESSAGE' | 'CASE_STATUS_CHANGED' | 'CASE_ASSIGNED' | 'TEST_ALERT';
  title: string;
  message: string;
  caseId: string;
  trackingCode?: string;
  timestamp: string;
};

export async function broadcastNotification(event: RealtimeEvent) {
  // 1. Emit in-memory event to active SSE stream listeners
  notificationEmitter.emit('notification', event);

  // 2. Persist to database so notifications are retained across reloads, reconnects and page changes
  try {
    await prisma.notification.create({
      data: {
        title: event.title,
        content: event.message,
        caseId: event.caseId || null,
        isRead: false,
      },
    });
  } catch (err) {
    console.error('Falha ao persistir notificação na BD:', err);
  }
}

export async function getRecentNotifications(limit = 30) {
  try {
    const items = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    const unreadCount = await prisma.notification.count({
      where: { isRead: false },
    });
    return {
      notifications: items.map((n) => ({
        id: n.id,
        type: 'NOTIFICATION',
        title: n.title,
        message: n.content,
        caseId: n.caseId || '',
        timestamp: n.createdAt.toISOString(),
        isRead: n.isRead,
      })),
      unreadCount,
    };
  } catch (err) {
    console.error('Erro ao ler notificações:', err);
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await prisma.notification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });
    return true;
  } catch (err) {
    console.error('Erro ao marcar notificações como lidas:', err);
    return false;
  }
}
