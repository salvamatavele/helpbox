import { NextRequest, NextResponse } from 'next/server';
import { getStaffSession } from '@/lib/services/auth-service';
import { referCase, getAdminCaseById } from '@/lib/services/case-service';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const { departmentId, assignedToId, reason, priority } = body;

  if (!departmentId || typeof departmentId !== 'string') {
    return NextResponse.json(
      { error: 'O departamento de destino é obrigatório.' },
      { status: 400 }
    );
  }

  if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
    return NextResponse.json(
      { error: 'Por favor, forneça uma justificação técnica detalhada para o encaminhamento (mínimo 5 caracteres).' },
      { status: 400 }
    );
  }

  const success = await referCase({
    caseId: id,
    departmentId,
    assignedToId: assignedToId || null,
    reason: reason.trim(),
    priority,
    actorId: session.id,
    actorName: session.name,
  });

  if (!success) {
    return NextResponse.json(
      { error: 'Falha ao processar encaminhamento. Verifique os dados fornecidos.' },
      { status: 500 }
    );
  }

  const updated = await getAdminCaseById(id);
  return NextResponse.json({
    success: true,
    message: 'Processo encaminhado com sucesso!',
    case: updated,
  });
}
