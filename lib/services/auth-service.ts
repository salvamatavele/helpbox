import { prisma } from '../prisma';
import { hashPassword, verifyPassword } from '../utils';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'helpbox_staff_session';

export interface StaffSessionUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SOCIAL_WORKER' | 'SPECIALIST';
  departmentId?: string | null;
  departmentName?: string;
}

// In-memory fallback users for seamless development before DB migration
const mockUsers: (StaffSessionUser & { passwordHash: string })[] = [];

export async function ensureDefaultStaff(): Promise<void> {
  const defaultEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@helpbox.mz';
  const defaultPass = process.env.ADMIN_DEFAULT_PASSWORD || 'admin_secure_password_2026';

  try {
    const existing = await prisma.user.findUnique({
      where: { email: defaultEmail },
    });

    if (!existing) {
      // Ensure default department exists
      let dept = await prisma.department.findFirst({
        where: { name: 'Apoio Psicossocial & Triagem Geral' },
      });

      if (!dept) {
        dept = await prisma.department.create({
          data: {
            name: 'Apoio Psicossocial & Triagem Geral',
            description: 'Departamento de acolhimento e triagem humanizada inicial',
          },
        });
      }

      const passwordHash = await hashPassword(defaultPass);
      await prisma.user.create({
        data: {
          email: defaultEmail,
          name: 'Dra. Amina Silva (Assistente Social Sénior)',
          passwordHash,
          role: 'ADMIN',
          departmentId: dept.id,
        },
      });
      console.log('Default administrator/caseworker created:', defaultEmail);
    }
  } catch (_err) {
    // If DB is unreachable during build or offline dev, fallback gracefully to mock
    if (mockUsers.length === 0) {
      const passwordHash = await hashPassword(defaultPass);
      mockUsers.push({
        id: 'mock-admin-id',
        email: defaultEmail,
        name: 'Dra. Amina Silva (Assistente Social Sénior)',
        passwordHash,
        role: 'ADMIN',
        departmentName: 'Apoio Psicossocial & Triagem Geral',
      });
    }
  }
}

export async function authenticateStaff(email: string, password: string): Promise<StaffSessionUser | null> {
  await ensureDefaultStaff();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { department: true },
    });

    if (user) {
      const valid = await verifyPassword(password, user.passwordHash);
      if (valid) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as StaffSessionUser['role'],
          departmentId: user.departmentId,
          departmentName: user.department?.name,
        };
      }
    }
  } catch (_err) {
    // Check in-memory fallback
    const fallback = mockUsers.find((u) => u.email === email);
    if (fallback) {
      const valid = await verifyPassword(password, fallback.passwordHash);
      if (valid) {
        return {
          id: fallback.id,
          name: fallback.name,
          email: fallback.email,
          role: fallback.role,
          departmentId: fallback.departmentId,
          departmentName: fallback.departmentName,
        };
      }
    }
  }

  return null;
}

export async function setStaffSession(user: StaffSessionUser): Promise<void> {
  const cookieStore = await cookies();
  const serialized = Buffer.from(JSON.stringify(user)).toString('base64');
  cookieStore.set(SESSION_COOKIE_NAME, serialized, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getStaffSession(): Promise<StaffSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;

    const json = Buffer.from(cookie.value, 'base64').toString('utf-8');
    return JSON.parse(json) as StaffSessionUser;
  } catch {
    return null;
  }
}

export async function clearStaffSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
