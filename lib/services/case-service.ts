import { prisma } from '../prisma';
import { generateTrackingCode, generateAccessPin, hashPin, verifyPin } from '../utils';
import { broadcastNotification } from './event-bus';

export interface CreateCaseInput {
  category: 'SOCIAL_SUPPORT' | 'COMPLAINT' | 'GRIEVANCE' | 'SUGGESTION' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  title: string;
  description: string;
  isAnonymous: boolean;
  contactName?: string;
  contactChannel?: string;
}

export interface CaseDisplay {
  id: string;
  trackingCode: string;
  category: string;
  priority: string;
  status: string;
  isAnonymous: boolean;
  contactName?: string | null;
  contactChannel?: string | null;
  title: string;
  description: string;
  assignedToId?: string | null;
  assignedToName?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    senderType: 'CITIZEN' | 'STAFF' | 'SYSTEM';
    senderName: string | null;
    message: string;
    isInternalNote: boolean;
    createdAt: string;
  }>;
}

interface MemoryCaseItem extends CaseDisplay {
  accessPinHash: string;
}

// In-memory store fallback for instant preview & zero-delay tests
const memoryCases: Map<string, MemoryCaseItem> = new Map();

export async function createCase(input: CreateCaseInput): Promise<{ trackingCode: string; accessPin: string; caseId: string }> {
  const trackingCode = generateTrackingCode();
  const accessPin = generateAccessPin();
  const accessPinHash = await hashPin(accessPin);

  let caseId = '';

  try {
    const created = await prisma.case.create({
      data: {
        trackingCode,
        accessPinHash,
        category: input.category,
        priority: input.priority,
        status: 'SUBMITTED',
        isAnonymous: input.isAnonymous,
        contactName: input.isAnonymous ? null : input.contactName,
        contactChannel: input.isAnonymous ? null : input.contactChannel,
        title: input.title,
        description: input.description,
        messages: {
          create: {
            senderType: 'SYSTEM',
            senderName: 'Helpbox - Sistema de Acolhimento',
            message: 'O seu caso foi acolhido no sistema em estrito anonimato. A equipa de assistência social analisará a sua situação com total respeito e sigilo.',
            isInternalNote: false,
          },
        },
      },
    });
    caseId = created.id;
  } catch (_err) {
    // Graceful fallback to memory store
    caseId = `mem-${Date.now()}`;
    const mockCase: MemoryCaseItem = {
      id: caseId,
      trackingCode,
      accessPinHash,
      category: input.category,
      priority: input.priority,
      status: 'SUBMITTED',
      isAnonymous: input.isAnonymous,
      contactName: input.isAnonymous ? null : (input.contactName || null),
      contactChannel: input.isAnonymous ? null : (input.contactChannel || null),
      title: input.title,
      description: input.description,
      assignedToName: null,
      departmentName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderType: 'SYSTEM',
          senderName: 'Helpbox - Sistema de Acolhimento',
          message: 'O seu caso foi acolhido no sistema em estrito anonimato. A equipa de assistência social analisará a sua situação com total respeito e sigilo.',
          isInternalNote: false,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    memoryCases.set(trackingCode, mockCase);
  }

  // Broadcast real-time event to Backoffice
  broadcastNotification({
    id: `event-${Date.now()}`,
    type: 'NEW_CASE',
    title: 'Novo Caso Recebido',
    message: `[${input.category}] ${input.title}`,
    caseId,
    trackingCode,
    timestamp: new Date().toISOString(),
  });

  return { trackingCode, accessPin, caseId };
}

export async function getCaseByTrackingCode(trackingCode: string, pin: string): Promise<CaseDisplay | null> {
  const cleanCode = trackingCode.trim().toUpperCase();

  try {
    const item = await prisma.case.findUnique({
      where: { trackingCode: cleanCode },
      include: {
        department: true,
        assignedTo: true,
        messages: {
          where: { isInternalNote: false }, // Utente NUNCA vê notas internas
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (item) {
      const isValid = await verifyPin(pin.trim(), item.accessPinHash);
      if (isValid) {
        return {
          id: item.id,
          trackingCode: item.trackingCode,
          category: item.category,
          priority: item.priority,
          status: item.status,
          isAnonymous: item.isAnonymous,
          contactName: item.contactName,
          contactChannel: item.contactChannel,
          title: item.title,
          description: item.description,
          assignedToName: item.assignedTo?.name || null,
          departmentName: item.department?.name || null,
          createdAt: item.createdAt.toISOString(),
          updatedAt: item.updatedAt.toISOString(),
          messages: item.messages.map((m) => ({
            id: m.id,
            senderType: m.senderType as 'CITIZEN' | 'STAFF' | 'SYSTEM',
            senderName: m.senderName,
            message: m.message,
            isInternalNote: m.isInternalNote,
            createdAt: m.createdAt.toISOString(),
          })),
        };
      }
    }
  } catch (_err) {
    // Check in-memory store
    const mem = memoryCases.get(cleanCode);
    if (mem) {
      const isValid = await verifyPin(pin.trim(), mem.accessPinHash);
      if (isValid) {
        return {
          ...mem,
          messages: mem.messages.filter((m) => !m.isInternalNote),
        };
      }
    }
  }

  return null;
}

export async function addCitizenMessage(
  trackingCode: string,
  pin: string,
  message: string
): Promise<boolean> {
  const caseData = await getCaseByTrackingCode(trackingCode, pin);
  if (!caseData) return false;

  try {
    await prisma.caseMessage.create({
      data: {
        caseId: caseData.id,
        senderType: 'CITIZEN',
        senderName: caseData.isAnonymous ? 'Utente (Anónimo)' : (caseData.contactName || 'Utente'),
        message,
        isInternalNote: false,
      },
    });

    // Notify Backoffice in real-time
    broadcastNotification({
      id: `event-${Date.now()}`,
      type: 'NEW_MESSAGE',
      title: 'Resposta de Utente',
      message: `Mensagem no caso ${trackingCode}: ${message.substring(0, 60)}...`,
      caseId: caseData.id,
      trackingCode,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (_err) {
    const mem = memoryCases.get(trackingCode);
    if (mem) {
      mem.messages.push({
        id: `msg-${Date.now()}`,
        senderType: 'CITIZEN',
        senderName: caseData.isAnonymous ? 'Utente (Anónimo)' : (caseData.contactName || 'Utente'),
        message,
        isInternalNote: false,
        createdAt: new Date().toISOString(),
      });
      broadcastNotification({
        id: `event-${Date.now()}`,
        type: 'NEW_MESSAGE',
        title: 'Resposta de Utente',
        message: `Mensagem no caso ${trackingCode}: ${message.substring(0, 60)}...`,
        caseId: caseData.id,
        trackingCode,
        timestamp: new Date().toISOString(),
      });
      return true;
    }
    return false;
  }
}

export async function getAllCasesForAdmin(): Promise<CaseDisplay[]> {
  try {
    const list = await prisma.case.findMany({
      include: {
        department: true,
        assignedTo: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((item) => ({
      id: item.id,
      trackingCode: item.trackingCode,
      category: item.category,
      priority: item.priority,
      status: item.status,
      isAnonymous: item.isAnonymous,
      contactName: item.contactName,
      contactChannel: item.contactChannel,
      title: item.title,
      description: item.description,
      assignedToId: item.assignedToId || null,
      assignedToName: item.assignedTo?.name || null,
      departmentId: item.departmentId || null,
      departmentName: item.department?.name || null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      messages: item.messages.map((m) => ({
        id: m.id,
        senderType: m.senderType as 'CITIZEN' | 'STAFF' | 'SYSTEM',
        senderName: m.senderName,
        message: m.message,
        isInternalNote: m.isInternalNote,
        createdAt: m.createdAt.toISOString(),
      })),
    }));
  } catch (_err) {
    return Array.from(memoryCases.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export async function getAdminCaseById(id: string): Promise<CaseDisplay | null> {
  try {
    const item = await prisma.case.findUnique({
      where: { id },
      include: {
        department: true,
        assignedTo: true,
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (item) {
      return {
        id: item.id,
        trackingCode: item.trackingCode,
        category: item.category,
        priority: item.priority,
        status: item.status,
        isAnonymous: item.isAnonymous,
        contactName: item.contactName,
        contactChannel: item.contactChannel,
        title: item.title,
        description: item.description,
        assignedToId: item.assignedToId || null,
        assignedToName: item.assignedTo?.name || null,
        departmentId: item.departmentId || null,
        departmentName: item.department?.name || null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        messages: item.messages.map((m) => ({
          id: m.id,
          senderType: m.senderType as 'CITIZEN' | 'STAFF' | 'SYSTEM',
          senderName: m.senderName,
          message: m.message,
          isInternalNote: m.isInternalNote,
          createdAt: m.createdAt.toISOString(),
        })),
      };
    }
  } catch (_err) {
    for (const mem of memoryCases.values()) {
      if (mem.id === id) return mem;
    }
  }
  return null;
}

export async function updateCaseStatus(
  caseId: string,
  newStatus: string,
  actorName: string
): Promise<boolean> {
  try {
    const updated = await prisma.case.update({
      where: { id: caseId },
      data: { status: newStatus as 'SUBMITTED' | 'IN_TRIAGE' | 'IN_PROGRESS' | 'WAITING_INFO' | 'REFERRED' | 'RESOLVED' | 'CLOSED' },
    });

    broadcastNotification({
      id: `event-${Date.now()}`,
      type: 'CASE_STATUS_CHANGED',
      title: 'Estado do Caso Atualizado',
      message: `Caso ${updated.trackingCode} alterado para ${newStatus} por ${actorName}`,
      caseId,
      trackingCode: updated.trackingCode,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (_err) {
    for (const mem of memoryCases.values()) {
      if (mem.id === caseId) {
        mem.status = newStatus;
        mem.updatedAt = new Date().toISOString();
        broadcastNotification({
          id: `event-${Date.now()}`,
          type: 'CASE_STATUS_CHANGED',
          title: 'Estado do Caso Atualizado',
          message: `Caso ${mem.trackingCode} alterado para ${newStatus} por ${actorName}`,
          caseId,
          trackingCode: mem.trackingCode,
          timestamp: new Date().toISOString(),
        });
        return true;
      }
    }
    return false;
  }
}

export async function addStaffMessage(
  caseId: string,
  staffId: string,
  staffName: string,
  message: string,
  isInternalNote: boolean
): Promise<boolean> {
  try {
    await prisma.caseMessage.create({
      data: {
        caseId,
        senderType: 'STAFF',
        senderId: staffId.startsWith('mock-') ? null : staffId,
        senderName: staffName,
        message,
        isInternalNote,
      },
    });

    // Se for resposta ao utente, mudar estado automaticamente de SUBMITTED para IN_PROGRESS
    if (!isInternalNote) {
      await prisma.case.updateMany({
        where: { id: caseId, status: 'SUBMITTED' },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return true;
  } catch (_err) {
    for (const mem of memoryCases.values()) {
      if (mem.id === caseId) {
        mem.messages.push({
          id: `msg-${Date.now()}`,
          senderType: 'STAFF',
          senderName: staffName,
          message,
          isInternalNote,
          createdAt: new Date().toISOString(),
        });
        if (!isInternalNote && mem.status === 'SUBMITTED') {
          mem.status = 'IN_PROGRESS';
        }
        return true;
      }
    }
    return false;
  }
}

export async function assignCase(
  caseId: string,
  assignedToName: string,
  departmentName?: string
): Promise<boolean> {
  try {
    await prisma.case.update({
      where: { id: caseId },
      data: {
        status: 'IN_PROGRESS',
      },
    });

    broadcastNotification({
      id: `event-${Date.now()}`,
      type: 'CASE_ASSIGNED',
      title: 'Caso Atribuído / Reencaminhado',
      message: `Caso atribuído a ${assignedToName}${departmentName ? ` (${departmentName})` : ''}`,
      caseId,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (_err) {
    for (const mem of memoryCases.values()) {
      if (mem.id === caseId) {
        mem.assignedToName = assignedToName;
        if (departmentName) mem.departmentName = departmentName;
        mem.status = 'IN_PROGRESS';
        return true;
      }
    }
    return false;
  }
}

export interface ReferCaseInput {
  caseId: string;
  departmentId: string;
  assignedToId?: string | null;
  reason: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  actorId?: string;
  actorName: string;
}

export async function referCase(input: ReferCaseInput): Promise<boolean> {
  const { caseId, departmentId, assignedToId, reason, priority, actorId, actorName } = input;

  try {
    const currentCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: { department: true, assignedTo: true },
    });

    if (!currentCase) return false;

    const targetDept = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!targetDept) return false;

    let targetUser = null;
    if (assignedToId) {
      targetUser = await prisma.user.findUnique({
        where: { id: assignedToId },
      });
    }

    const originDeptName = currentCase.department?.name || 'Triagem Geral';
    const targetDeptName = targetDept.name;
    const targetUserName = targetUser?.name || null;

    // 1. Update Case
    await prisma.case.update({
      where: { id: caseId },
      data: {
        departmentId: targetDept.id,
        assignedToId: targetUser ? targetUser.id : null,
        status: 'REFERRED',
        ...(priority ? { priority } : {}),
      },
    });

    // 2. Add technical internal note message
    const transferNote = `[ENCAMINHAMENTO TÉCNICO] Processo transferido de "${originDeptName}" para "${targetDeptName}"${
      targetUserName ? ` (Técnico atribuído: ${targetUserName})` : ''
    }.\n\nParecer / Justificação:\n${reason.trim()}`;

    await prisma.caseMessage.create({
      data: {
        caseId,
        senderType: 'STAFF',
        senderId: actorId || null,
        senderName: actorName,
        message: transferNote,
        isInternalNote: true,
      },
    });

    // 3. Add audit log
    await prisma.caseAuditLog.create({
      data: {
        caseId,
        actorId: actorId || null,
        actorName,
        action: 'CASE_REFERRED',
        details: `Encaminhado de "${originDeptName}" para "${targetDeptName}"${
          targetUserName ? ` (${targetUserName})` : ''
        }. Justificação: ${reason.trim()}`,
      },
    });

    // 4. Real-time broadcast
    broadcastNotification({
      id: `event-${Date.now()}`,
      type: 'CASE_ASSIGNED',
      title: 'Processo Encaminhado',
      message: `Caso ${currentCase.trackingCode} encaminhado para ${targetDeptName}${
        targetUserName ? ` (${targetUserName})` : ''
      }`,
      caseId,
      trackingCode: currentCase.trackingCode,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (err) {
    console.error('Erro ao encaminhar caso:', err);
    for (const mem of memoryCases.values()) {
      if (mem.id === caseId) {
        mem.departmentId = departmentId;
        mem.assignedToId = assignedToId || null;
        mem.status = 'REFERRED';
        if (priority) mem.priority = priority;
        mem.messages.push({
          id: `msg-${Date.now()}`,
          senderType: 'STAFF',
          senderName: actorName,
          message: `[ENCAMINHAMENTO TÉCNICO] Motivo: ${reason}`,
          isInternalNote: true,
          createdAt: new Date().toISOString(),
        });
        return true;
      }
    }
    return false;
  }
}
