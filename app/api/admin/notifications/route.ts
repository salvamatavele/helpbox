import { NextResponse } from 'next/server';
import { getRecentNotifications, markAllNotificationsAsRead, broadcastNotification } from '@/lib/services/event-bus';
import { getStaffSession } from '@/lib/services/auth-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const data = await getRecentNotifications(30);
  return NextResponse.json(data);
}

export async function PATCH() {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  await markAllNotificationsAsRead();
  return NextResponse.json({ success: true, message: 'Todas as notificações marcadas como lidas.' });
}

export async function POST(req: Request) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const testTitle = body.title || 'Notificação de Teste do Sistema';
    const testMessage = body.message || 'O canal de notificações em direto da equipa técnica está operacional e ativo.';

    await broadcastNotification({
      id: `test-${Date.now()}`,
      type: 'TEST_ALERT',
      title: testTitle,
      message: testMessage,
      caseId: '',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Notificação de teste emitida com sucesso!',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Falha ao emitir notificação de teste';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
