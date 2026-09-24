import { NextRequest, NextResponse } from 'next/server';
import { getStaffSession } from '@/lib/services/auth-service';
import { getAllUsers, createUser, getAllDepartments } from '@/lib/services/user-service';

export async function GET() {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const [users, departments] = await Promise.all([
    getAllUsers(),
    getAllDepartments(),
  ]);

  return NextResponse.json({ users, departments, currentUserRole: session.role });
}

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Apenas administradores podem registar novos membros na equipa.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, email, role, departmentId, password } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são campos obrigatórios.' },
        { status: 400 }
      );
    }

    const result = await createUser({
      name,
      email,
      role: role || 'SOCIAL_WORKER',
      departmentId,
      password,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao processar registo.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
