import { NextRequest } from 'next/server';
import { notificationEmitter, RealtimeEvent } from '@/lib/services/event-bus';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection packet
      const initMessage = `data: ${JSON.stringify({
        type: 'CONNECTED',
        message: 'Canal de notificações em tempo real ativo',
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initMessage));

      const onNotification = (event: RealtimeEvent) => {
        try {
          const payload = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (err) {
          console.warn('Erro ao transmitir SSE:', err);
        }
      };

      notificationEmitter.on('notification', onNotification);

      // Keepalive heartbeat every 25 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 25000);

      req.signal.addEventListener('abort', () => {
        notificationEmitter.off('notification', onNotification);
        clearInterval(heartbeatInterval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
