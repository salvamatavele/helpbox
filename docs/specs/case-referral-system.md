# Especificação de Funcionalidade: Sistema Avançado de Encaminhamento Interdepartamental

## 1. Visão Geral e Contexto de Serviço Social
O encaminhamento de processos (*referral/handover*) é um ato técnico de alta relevância no Serviço Social. Quando uma denúncia, pedido de acolhimento psicossocial ou queixa chega ao Helpbox, a triagem inicial pode determinar que a resolução exige competência técnica específica (ex.: apoio jurídico preliminar, ouvidoria e denúncias de corrupção, acolhimento de proteção infantil ou apoio psicossocial continuado).

Para garantir rigor ético, continuidade no atendimento e transparência interna:
1. O encaminhamento não pode ser uma mera alteração de texto solto: deve associar formalmente o caso ao `departmentId` e opcionalmente a um técnico do departamento de destino (`assignedToId`).
2. Deve exigir uma **nota de fundamentação técnica do encaminhamento** (justificação de transferência), essencial para o técnico que recebe o caso.
3. Deve gerar um registo no histórico de mensagens (nota interna visível para a equipa) e uma entrada no `CaseAuditLog`.
4. Deve disparar notificação em tempo real alertando os membros do departamento recetor.
5. O Dashboard deve permitir filtrar por departamento de lotação ("Casos do Meu Departamento", "Atribuídos a Mim", "Todos").

---

## 2. Requisitos Funcionais

### 2.1 Interface de Encaminhamento no Detalhe do Caso (`/admin/cases/[id]`)
- **Carregamento Dinâmico de Departamentos e Profissionais**:
  - A lista de departamentos de destino deve ser carregada diretamente da base de dados (`Department.findMany()`).
  - Ao selecionar um departamento de destino, a interface deve carregar e exibir a lista dos técnicos/especialistas ativos pertencentes àquele departamento.
- **Painel/Modal de Encaminhamento Técnico**:
  - Seleção de Departamento de Destino (obrigatório).
  - Seleção de Técnico Responsável no Destino (opcional; se omitido, o caso fica atribuído à triagem geral do departamento recetor).
  - Grau de Prioridade de Transferência (mantém ou atualiza para `URGENT` / `HIGH` / `MEDIUM` / `NORMAL`).
  - **Parecer / Justificação do Encaminhamento** (campo de texto obrigatório, mínimo 10 caracteres).
- **Feedback Imediato**:
  - Alerta de sucesso informando a conclusão da transferência.
  - Atualização automática do crachá de departamento e técnico na página.

### 2.2 Regras de Negócio e Base de Dados
- **Transição de Estado**:
  - O estado do caso deve ser atualizado para **`REFERRED`** (ou `IN_PROGRESS` se já atribuído diretamente a um técnico que assume imediatamente).
- **Associação Relacional no Prisma**:
  - `departmentId`: atualizado para o ID do departamento de destino.
  - `assignedToId`: atualizado para o ID do utilizador destinatário (ou `null` se for para a equipa do departamento como um todo).
- **Histórico & Auditoria**:
  - Criar automaticamente uma `CaseMessage` marcada como `isInternalNote: true`, emitida com o nome do assistente que executou o encaminhamento:
    *"Transferência de Processo: Caso encaminhado do departamento [Nome Origem] para [Nome Destino]. Motivo: [Justificação]"*.
  - Criar um registo em `CaseAuditLog`:
    - `action: 'CASE_REFERRED'`
    - `actorId: session.user.id`
    - `actorName: session.user.name`
    - `details: 'Encaminhado para [Nome Destino] por motivo de [Justificação]'`
- **Notificação em Tempo Real**:
  - Emissão de `RealtimeEvent` com `type: 'CASE_ASSIGNED'` e gravação em `Notification` com título e detalhes claros do departamento recetor.

### 2.3 Filtros Operacionais no Dashboard (`/admin/dashboard`)
- Adicionar filtro rápido de visualização:
  - **"Todos os Processos"** (visão geral)
  - **"Meu Departamento"** (filtra casos associados ao `departmentId` do utilizador autenticado)
  - **"Atribuídos a Mim"** (filtra casos onde `assignedToId === currentUser.id`)
- Exibição visível do nome do departamento e do técnico responsável em cada linha da tabela de casos.

---

## 3. Endpoints e Contratos de API

### 3.1 `GET /api/admin/departments`
Retorna a lista de departamentos disponíveis e seus respetivos membros ativos:
```json
[
  {
    "id": "uuid-dept",
    "name": "Apoio Jurídico & Direitos Humanos",
    "description": "Orientação legal preliminar e salvaguarda de direitos fundamentais.",
    "members": [
      {
        "id": "uuid-user",
        "name": "Dra. Isabel Macamo",
        "email": "isabel@helpbox.mz",
        "role": "SPECIALIST"
      }
    ]
  }
]
```

### 3.2 `POST /api/admin/cases/[id]/refer`
Executa o encaminhamento formal do caso:
- **Corpo da Requisição (JSON)**:
  ```json
  {
    "departmentId": "uuid-dept",
    "assignedToId": "uuid-user-opcional",
    "reason": "Processo requer análise urgente de violação de direitos fundamentais e suporte legal.",
    "priority": "HIGH"
  }
  ```
- **Resposta (200 OK)**:
  Retorna o objeto do caso atualizado com as relações recarregadas (`department`, `assignedTo`, `messages`, `auditLogs`).

---

## 4. Critérios de Aceitação

1. [x] **Seleção Dinâmica**: Departamentos e profissionais carregam dinamicamente da base de dados MariaDB sem strings fixas no código.
2. [x] **Justificação Obrigatória**: O sistema bloqueia tentativas de encaminhamento sem fundamentação técnica/motivo.
3. [x] **Vínculo Relacional**: Ao encaminhar, o registo na tabela `Case` atualiza os campos relacionais `departmentId` e `assignedToId`.
4. [x] **Rastreabilidade no Histórico**: É gerada automaticamente uma nota interna com a justificação e autor do encaminhamento.
5. [x] **Notificação Ativa**: O canal SSE e a tabela `Notification` registam o alerta de transferência.
6. [x] **Filtros no Dashboard**: O utilizador no dashboard consegue alternar entre "Todos", "Meu Departamento" e "Atribuídos a Mim".
7. [x] **Testes Automatizados**: A suite de testes (`npm test`) cobre a validação de parâmetros e a integridade da lógica de transferência.
