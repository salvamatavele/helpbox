import { NextRequest, NextResponse } from 'next/server';
import { getStaffSession, setStaffSession } from '@/lib/services/auth-service';
import { updateOwnProfile } from '@/lib/services/user-service';

export async function GET() {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  return NextResponse.json({ user: session });
}

export async function PATCH(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    const result = await updateOwnProfile(session.id, {
      name,
      email,
      currentPassword,
      newPassword,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (result.updatedUser) {
      // Update session cookie with new details
      await setStaffSession({
        id: result.updatedUser.id,
        name: result.updatedUser.name,
        email: result.updatedUser.email,
        role: result.updatedUser.role,
        departmentName: result.updatedUser.departmentName,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso.',
      user: result.updatedUser,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao atualizar perfil.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
