import { prisma } from '../prisma';
import { hashPassword, verifyPassword } from '../utils';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SOCIAL_WORKER' | 'SPECIALIST';
  departmentId: string | null;
  departmentName?: string;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: 'ADMIN' | 'SOCIAL_WORKER' | 'SPECIALIST';
  departmentId?: string;
  password?: string;
}

export const DEFAULT_RESET_PASSWORD = 'admin123';

export async function getAllDepartments() {
  try {
    return await prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (_err) {
    return [
      { id: 'dept-1', name: 'Apoio Psicossocial & Triagem Geral', description: null },
      { id: 'dept-2', name: 'Ouvidoria & Denúncias', description: null },
      { id: 'dept-3', name: 'Proteção da Família e Vulneráveis', description: null },
      { id: 'dept-4', name: 'Apoio Jurídico & Direitos Humanos', description: null },
    ];
  }
}

export async function getAllUsers(): Promise<UserSummary[]> {
  try {
    const users = await prisma.user.findMany({
      include: { department: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as UserSummary['role'],
      departmentId: u.departmentId,
      departmentName: u.department?.name,
      createdAt: u.createdAt.toISOString(),
    }));
  } catch (_err) {
    return [];
  }
}

export async function createUser(input: CreateUserInput): Promise<{ success: boolean; user?: UserSummary; error?: string }> {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.trim().toLowerCase() },
    });

    if (existing) {
      return { success: false, error: 'Já existe um utilizador registado com este endereço de email.' };
    }

    const passwordToUse = input.password && input.password.trim().length > 0 ? input.password.trim() : DEFAULT_RESET_PASSWORD;
    const passwordHash = await hashPassword(passwordToUse);

    const created = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        role: input.role,
        departmentId: input.departmentId || null,
        passwordHash,
      },
      include: { department: true },
    });

    return {
      success: true,
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role as UserSummary['role'],
        departmentId: created.departmentId,
        departmentName: created.department?.name,
        createdAt: created.createdAt.toISOString(),
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao criar utilizador.';
    return { success: false, error: message };
  }
}

export async function resetUserPassword(userId: string, newPassword: string = DEFAULT_RESET_PASSWORD): Promise<{ success: boolean; defaultPassword: string; error?: string }> {
  try {
    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true, defaultPassword: newPassword };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao redefinir palavra-passe.';
    return { success: false, defaultPassword: newPassword, error: message };
  }
}

export async function deleteUser(userId: string, requestingAdminId: string): Promise<{ success: boolean; error?: string }> {
  if (userId === requestingAdminId) {
    return { success: false, error: 'Não é permitido eliminar a sua própria conta de administrador.' };
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao eliminar utilizador.';
    return { success: false, error: message };
  }
}

export async function updateOwnProfile(
  userId: string,
  data: {
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }
): Promise<{ success: boolean; updatedUser?: UserSummary; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true },
    });

    if (!user) {
      return { success: false, error: 'Utilizador não encontrado.' };
    }

    // If changing password, verify current password first
    if (data.newPassword && data.newPassword.trim().length > 0) {
      if (!data.currentPassword) {
        return { success: false, error: 'É necessário introduzir a palavra-passe atual para definir uma nova.' };
      }

      const isValid = await verifyPassword(data.currentPassword, user.passwordHash);
      if (!isValid) {
        return { success: false, error: 'A palavra-passe atual está incorreta.' };
      }
    }

    const updatePayload: Record<string, string | null> = {};
    if (data.name && data.name.trim().length > 0) {
      updatePayload.name = data.name.trim();
    }
    if (data.email && data.email.trim().length > 0) {
      updatePayload.email = data.email.trim().toLowerCase();
    }
    if (data.newPassword && data.newPassword.trim().length >= 6) {
      updatePayload.passwordHash = await hashPassword(data.newPassword.trim());
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updatePayload,
      include: { department: true },
    });

    return {
      success: true,
      updatedUser: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role as UserSummary['role'],
        departmentId: updated.departmentId,
        departmentName: updated.department?.name,
        createdAt: updated.createdAt.toISOString(),
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao atualizar perfil.';
    return { success: false, error: message };
  }
}
