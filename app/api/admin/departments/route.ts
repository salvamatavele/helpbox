import { NextResponse } from 'next/server';
import { getStaffSession } from '@/lib/services/auth-service';
import { getDepartmentsWithMembers } from '@/lib/services/user-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getStaffSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const departments = await getDepartmentsWithMembers();
  return NextResponse.json(departments);
}
