import { PrismaClient, Role, Priority, CaseCategory, CaseStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 A iniciar o seeding da base de dados Helpbox...');

  // 1. Departamentos de Atendimento
  const departments = [
    {
      name: 'Apoio Psicossocial & Triagem Geral',
      description: 'Atendimento e acolhimento humanizado de situações de vulnerabilidade social e emocional.',
    },
    {
      name: 'Ouvidoria & Denúncias',
      description: 'Canal ético para receção e investigação de irregularidades, corrupção ou abusos de poder.',
    },
    {
      name: 'Proteção da Família e Vulneráveis',
      description: 'Suporte especializado a casos de violência doméstica, apoio infantil e assistência comunitária.',
    },
    {
      name: 'Apoio Jurídico & Direitos Humanos',
      description: 'Orientação legal preliminar e salvaguarda de direitos fundamentais.',
    },
  ];

  const createdDepartments = [];
  for (const dept of departments) {
    const d = await prisma.department.upsert({
      where: { name: dept.name },
      update: { description: dept.description },
      create: dept,
    });
    createdDepartments.push(d);
    console.log(`  ✓ Departamento garantido: ${d.name}`);
  }

  // 2. Administrador / Assistente Social Principal
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@helpbox.mz';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(adminPassword, salt);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: Role.ADMIN,
      departmentId: createdDepartments[0].id,
    },
    create: {
      email: adminEmail,
      name: 'Dra. Amina Silva (Assistente Social Sénior)',
      passwordHash,
      role: Role.ADMIN,
      departmentId: createdDepartments[0].id,
    },
  });
  console.log(`  ✓ Administrador/Assistente Social configurado: ${admin.email}`);

  // 3. Caso demonstrativo inicial (para verificação imediata no painel e na consulta)
  const demoTrackingCode = 'HB-DEMO-001';
  const demoPin = '123456';
  const demoPinHash = await bcrypt.hash(demoPin, salt);

  const existingDemo = await prisma.case.findUnique({
    where: { trackingCode: demoTrackingCode },
  });

  if (!existingDemo) {
    const demoCase = await prisma.case.create({
      data: {
        trackingCode: demoTrackingCode,
        accessPinHash: demoPinHash,
        category: CaseCategory.SOCIAL_SUPPORT,
        priority: Priority.MEDIUM,
        status: CaseStatus.IN_PROGRESS,
        isAnonymous: true,
        title: 'Pedido de Apoio para Acolhimento Comunitário',
        description: 'Exemplo de situação recebida no sistema Helpbox para testes de fluxo de resposta e acompanhamento pelo utente.',
        departmentId: createdDepartments[0].id,
        assignedToId: admin.id,
        messages: {
          create: [
            {
              senderType: 'SYSTEM',
              senderName: 'Helpbox - Sistema de Acolhimento',
              message: 'O seu caso foi acolhido no sistema em estrito anonimato. A equipa de assistência social analisará a sua situação com total respeito e sigilo.',
              isInternalNote: false,
            },
            {
              senderType: 'STAFF',
              senderId: admin.id,
              senderName: admin.name,
              message: 'Olá. O seu pedido de apoio foi recebido pela equipa de assistência social e estamos a articular o devido suporte.',
              isInternalNote: false,
            },
            {
              senderType: 'STAFF',
              senderId: admin.id,
              senderName: admin.name,
              message: 'Nota interna confidencial: Caso de demonstração verificado e ativo.',
              isInternalNote: true,
            },
          ],
        },
      },
    });
    console.log(`  ✓ Caso de demonstração criado com código: ${demoCase.trackingCode} (PIN: ${demoPin})`);
  }

  console.log('✅ Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
