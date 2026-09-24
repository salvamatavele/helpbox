import { NextRequest, NextResponse } from 'next/server';
import { createCase, getAllCasesForAdmin } from '@/lib/services/case-service';
import { getStaffSession } from '@/lib/services/auth-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.description || !body.category) {
      return NextResponse.json(
        { error: 'Campos obrigatórios em falta' },
        { status: 400 }
      );
    }

    const result = await createCase({
      category: body.category,
      priority: body.priority || 'MEDIUM',
      title: body.title,
      description: body.description,
      isAnonymous: body.isAnonymous !== false,
      contactName: body.contactName,
      contactChannel: body.contactChannel,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error('Erro ao registar caso:', err);
    return NextResponse.json(
      { error: 'Não foi possível registar o caso no momento' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const cases = await getAllCasesForAdmin();
  return NextResponse.json(cases);
}
