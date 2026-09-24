import { NextRequest, NextResponse } from 'next/server';
import { getStaffSession } from '@/lib/services/auth-service';
import { addStaffMessage, getAdminCaseById } from '@/lib/services/case-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  if (!body.message || body.message.trim().length === 0) {
    return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 });
  }

  const isInternalNote = Boolean(body.isInternalNote);

  await addStaffMessage(
    id,
    session.id,
    session.name,
    body.message.trim(),
    isInternalNote
  );

  const updated = await getAdminCaseById(id);
  return NextResponse.json(updated, { status: 201 });
}
