import { NextRequest, NextResponse } from 'next/server';
import { getStaffSession } from '@/lib/services/auth-service';
import {
  getAdminCaseById,
  updateCaseStatus,
  assignCase,
} from '@/lib/services/case-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const item = await getAdminCaseById(id);
  if (!item) {
    return NextResponse.json({ error: 'Caso não encontrado' }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  if (body.status) {
    await updateCaseStatus(id, body.status, session.name);
  }

  if (body.assignedToName !== undefined || body.departmentName !== undefined) {
    await assignCase(
      id,
      body.assignedToName || session.name,
      body.departmentName
    );
  }

  const updated = await getAdminCaseById(id);
  return NextResponse.json(updated);
}
