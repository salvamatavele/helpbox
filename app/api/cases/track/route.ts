import { NextRequest, NextResponse } from 'next/server';
import { getCaseByTrackingCode, addCitizenMessage } from '@/lib/services/case-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { trackingCode, pin, action, message } = body;

    if (!trackingCode || !pin) {
      return NextResponse.json(
        { error: 'Código de rastreio e PIN são obrigatórios' },
        { status: 400 }
      );
    }

    if (action === 'ADD_MESSAGE') {
      if (!message || message.trim().length === 0) {
        return NextResponse.json(
          { error: 'Mensagem vazia' },
          { status: 400 }
        );
      }
      const success = await addCitizenMessage(trackingCode, pin, message.trim());
      if (!success) {
        return NextResponse.json(
          { error: 'Não foi possível enviar a mensagem. Verifique os dados.' },
          { status: 403 }
        );
      }
      // Return updated case
      const updatedCase = await getCaseByTrackingCode(trackingCode, pin);
      return NextResponse.json(updatedCase);
    }

    // Default action: query case details
    const caseData = await getCaseByTrackingCode(trackingCode, pin);
    if (!caseData) {
      return NextResponse.json(
        { error: 'Caso não encontrado ou credenciais incorretas' },
        { status: 404 }
      );
    }

    return NextResponse.json(caseData);
  } catch (err) {
    console.error('Erro na consulta do caso:', err);
    return NextResponse.json(
      { error: 'Falha interna ao processar consulta' },
      { status: 500 }
    );
  }
}
