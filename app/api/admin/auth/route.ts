import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateStaff,
  setStaffSession,
  getStaffSession,
  clearStaffSession,
} from '@/lib/services/auth-service';

export async function GET() {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session });
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e palavra-passe são obrigatórios' },
        { status: 400 }
      );
    }

    const user = await authenticateStaff(email, password);
    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas. Verifique o email e palavra-passe.' },
        { status: 401 }
      );
    }

    await setStaffSession(user);
    return NextResponse.json({ success: true, user });
  } catch (err) {
    console.error('Erro na autenticação de técnico:', err);
    return NextResponse.json(
      { error: 'Erro no servidor de autenticação' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await clearStaffSession();
  return NextResponse.json({ success: true });
}
