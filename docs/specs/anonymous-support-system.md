# Especificação do Sistema: Helpbox - Plataforma de Apoio e Queixas no Anonimato

## 1. Visão Geral e Contexto Humano (Abordagem de Serviço Social & Engenharia Sénior)
O **Helpbox** é concebido sob os princípios de **Segurança Psicológica, Não-Discriminação, Confidencialidade Absoluta e Conforto Emocional**. A pessoa que recorre ao sistema pode estar em situação de vulnerabilidade, sofrimento, medo de represálias ou busca de orientação ética e social. Por isso, a experiência pública deve transmitir acolhimento caloroso, discrição, zero rastreamento intrusivo e garantia real de anonimato.

---

## 2. Requisitos Funcionais

### 2.1 Módulo Público (Cidadão / Utente)
1. **Submissão Segura e Anónima**:
   - Classificação do caso por Tipo: *Pedido de Apoio Social/Emocional*, *Queixa/Denúncia*, *Reclamação Geral*, *Outro*.
   - Seleção de Grau de Urgência/Prioridade percebido pelo utente (*Baixa, Média, Alta/Crítica*).
   - Descrição detalhada do relato com salvaguarda de privacidade.
   - Identificação opcional e voluntária (campo recolhível por padrão: Nome/Contacto se desejar retorno direto; por defeito, estritamente anónimo).
   - Botão de saída rápida ("Saída Segura / Discreta") visível no cabeçalho (redireciona instantaneamente para um site neutro e limpa pré-visualizações se necessário).
2. **Emissão de Credencial de Acesso Única**:
   - Geração de Código Único de Rastreio (ex: `HB-7392-A9F`) + Chave/PIN de Acesso Pessoal.
   - Instrução visual e empática para salvaguarda segura desse código (cópia em um clique, aviso de que o sistema não guarda emails ou nomes no modo anónimo para recuperação).
3. **Consulta e Diálogo Continuado do Caso**:
   - Interface de consulta por Código de Rastreio e PIN.
   - Visualização da evolução do estado do caso com explicações empáticas e humanas (não apenas rótulos frios).
   - Histórico de mensagens/respostas da equipa de apoio.
   - Possibilidade de o utente enviar mensagens de acompanhamento ou clarificações adicionais sem quebrar o anonimato.
4. **Internacionalização (i18n)**:
   - Suporte nativo e instantâneo a **Português de Moçambique (PT-MZ)** (padrão) e **Inglês (EN)**.

### 2.2 Módulo Administrativo & Assistência Social (Backoffice)
1. **Autenticação e Papéis (RBAC)**:
   - Papéis: `ADMIN` (Administrador/Gestor Geral) e `CASE_WORKER` / `SOCIAL_WORKER` (Assistente Social / Técnico de Atendimento).
2. **Gestão e Triagem de Casos**:
   - Dashboard com métricas de acolhimento (casos novos, em análise, pendentes de resposta, resolvidos).
   - Filtros por categoria, prioridade, estado e técnico atribuído.
   - Atualização de Estado: `Submetido (Novo)`, `Em Triagem`, `Em Atendimento`, `Aguardando Informação`, `Encaminhado`, `Resolvido`, `Arquivado`.
3. **Encaminhamento e Atribuição**:
   - Encaminhar caso para departamentos/domínios específicos (ex.: Apoio Psicossocial, Jurídico, Proteção Social, Ouvidoria).
   - Atribuição/marcação direta de técnico responsável pela resposta.
3. **Notificações em Tempo Real no Backoffice**:
   - Notificação instantânea para a equipa técnica a cada nova submissão de caso ou nova mensagem de utente.
   - Suporte a Web Notification API (notificações nativas no navegador quando autorizado).
   - Indicador visual sonoro e de emblema (badge) em tempo real no painel administrativo via Server-Sent Events (SSE) ou polling de alta eficiência.
   - Central de notificações no cabeçalho do backoffice com histórico de alertas não lidos.
4. **Comunicação e Notas Internas**:
   - Envio de respostas oficiais que o utente visualiza na consulta pública.
   - Notas internas confidenciais (visíveis apenas para a equipa técnica, não expostas ao utente).
   - Registo de auditoria (quem visualizou, alterou estado ou respondeu).

### 2.3 Capacidades PWA (Progressive Web App)
1. **Instalabilidade & Experiência Mobile-First**:
   - Manifesto web (`manifest.json`) completo com suporte a instalação no ecrã principal (mobile/desktop).
   - Service Worker para gestão de cache de assets e modo offline com página de contingência empática.
   - Ícones adaptativos e máscara de cor discreta e reconfortante.

---

## 3. Arquitetura Técnica & Infraestrutura Docker

### 3.1 Stack Tecnológico
- **Frontend / Fullstack**: Next.js 16 (App Router, Server Actions, TypeScript, React 19).
- **Estilos & UI**: Tailwind CSS v4, Lucide Icons, micro-animações CSS e transições suaves.
- **ORM & Banco de Dados**: Prisma ORM conectado a **MariaDB 10.11+**.
- **Gestão de Banco**: phpMyAdmin oficial em container Docker.
- **Portas Atribuídas**:
  - `3004`: Aplicação Next.js (Helpbox Web)
  - `8034`: phpMyAdmin Web UI
  - `3306`: MariaDB (interno à rede Docker bridge)

### 3.2 Diagrama de Contêineres (Docker Compose)
```
+-------------------------------------------------------------+
|                        DOCKER HOST                          |
|                                                             |
|  Port 3004 ---------> [ helpbox-app (Next.js 16) ]          |
|                               |                             |
|                               v (internal network)          |
|  Port 8034 ---------> [ phpmyadmin ] ---> [ mariadb:10.11 ] |
+-------------------------------------------------------------+
```

---

## 4. Modelo de Dados (Prisma Schema - MariaDB)

- **User / Staff**: `id`, `name`, `email`, `password_hash`, `role` (`ADMIN`, `SOCIAL_WORKER`, `SPECIALIST`), `department`, `created_at`.
- **Case / Ticket**:
  - `id`, `tracking_code` (único, indexado), `access_pin_hash` (argon2/bcrypt ou token de alta entropia),
  - `category` (`SOCIAL_SUPPORT`, `COMPLAINT`, `GRIEVANCE`, `SUGGESTION`, `OTHER`),
  - `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`),
  - `status` (`SUBMITTED`, `IN_TRIAGE`, `IN_PROGRESS`, `WAITING_INFO`, `REFERRED`, `RESOLVED`, `CLOSED`),
  - `is_anonymous` (boolean),
  - `contact_name` (opcional, null se anónimo),
  - `contact_channel` (opcional: telefone/email),
  - `title`, `description`,
  - `assigned_to_id` (FK User opcional),
  - `department_id` (opcional),
  - `created_at`, `updated_at`.
- **CaseMessage**:
  - `id`, `case_id`, `sender_type` (`CITIZEN`, `STAFF`, `SYSTEM`),
  - `sender_id` (opcional, staff),
  - `message`,
  - `is_internal_note` (boolean - se true, utente não visualiza),
  - `created_at`.
- **CaseAuditLog**:
  - `id`, `case_id`, `actor_id` (opcional staff), `action` (STATUS_CHANGE, REASSIGN, REPLY, VIEW),
  - `details`, `created_at`.

---

## 5. Critérios de Aceitação & Testes
1. O cidadão pode submeter um caso sem preencher qualquer dado pessoal, obtendo de imediato o código e PIN de rastreio.
2. A página de consulta de caso valida o par código/PIN e apresenta apenas a informação autorizada e mensagens públicas do caso.
3. O painel administrativo permite autenticação de técnicos, filtragem, alteração de estado, atribuição a colegas e envio de mensagens públicas ou notas privadas.
4. O switcher PT-MZ / EN alterna todo o vocabulário em tempo real preservando coerência de contexto.
5. `docker compose up -d` sobe os serviços nas portas 3004 e 8034 sem erros.
