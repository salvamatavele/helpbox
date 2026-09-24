import { NextRequest, NextResponse } from 'next/server';
import { getStaffSession } from '@/lib/services/auth-service';
import { resetUserPassword, deleteUser, DEFAULT_RESET_PASSWORD } from '@/lib/services/user-service';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getStaffSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Apenas administradores podem redefinir palavras-passe de outros utilizadores.' },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json();

  if (body.action === 'RESET_PASSWORD') {
    const result = await resetUserPassword(id, body.newPassword || DEFAULT_RESET_PASSWORD);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      message: `Palavra-passe redefinida com sucesso para o padrão: ${result.defaultPassword}`,
      defaultPassword: result.defaultPassword,
    });
  }

  return NextResponse.json({ error: 'Ação desconhecida' }, { status: 400 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getStaffSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Apenas administradores podem remover membros da equipa.' },
      { status: 403 }
    );
  }

  const { id } = await params;
  const result = await deleteUser(id, session.id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: 'Utilizador removido com sucesso.' });
}
