# Especificação Técnica: UX Humanizada, Cores Relaxantes e Confiança Institucional no Helpbox

**Documento**: `docs/specs/ux-calm-trust-enhancement.md`  
**Autor**: Antigravity (Engenharia de Software & Serviço Social)  
**Data**: 2026-10-20  
**Estado**: Proposta para Aprovação  

---

## 1. Visão Geral e Justificação

O **Helpbox** destina-se a pessoas em situações de vulnerabilidade, necessidade de apoio psicossocial ou reporte confidencial de queixas e denúncias. Numa experiência de acolhimento social, o aspeto visual e as micro-interações desempenham um papel decisivo na **redução do cortisol e da ansiedade**, promovendo um ambiente de **segurança psicológica, discrição e autoridade ética**.

Esta especificação define a renovação do design visual, da paleta cromática calmante e das animações de micro-interação em todo o sistema (portal público e backoffice técnico), garantindo alta acessibilidade (WCAG 2.1 AA), elegância moderna e confiança inabalável.

---

## 2. Requisitos e Diretrizes de Design

### 2.1 Paleta Cromática Relaxante e de Confiança ("Cromoterapia da Escuta Ativa")
- **Cor Primária (Deep Ocean Teal)**: `#0f766e` / `#115e59` — transmite estabilidade, seriedade, proteção ética e apoio institucional sem frieza burocrática.
- **Cor de Fundo & Superfícies Acolhedoras (Soft Sage / Warm Slate Neutral)**:
  - Fundo principal: `#f8fafc` / `#f0fdfa` (gradientes suaves radiais com iluminação difusa, eliminando o branco puro ofuscante).
  - Cartões e Superfícies: `#ffffff` com bordas semitransparentes elegantes (`border-teal-900/10`) e sombras suaves com difusão orgânica (`shadow-sm`, `shadow-teal-950/5`).
- **Cores de Estado Harmonizadas (Anti-Pânico)**:
  - *Urgência / Alerta*: Tom coral/terracota suave (`#e11d48` / `#ea580c`), evitando vermelhos neon agressivos que induzem pânico ou sensação de ameaça.
  - *Sucesso / Confirmação*: Verde esmeralda sereno (`#059669`).
  - *Encaminhamentos / Apoio Técnico*: Anil suave / Índigo reflexivo (`#4f46e5` / `#6366f1`).
  - *Em Análise / Triagem*: Azul céu profundo (`#0284c7`).

### 2.2 Animações e Micro-interações Orgânicas (Calm Motion)
- **Princípio**: O movimento deve servir para orientar a atenção, tranquilizar o utente e dar feedback tátil — nunca para criar ruído visual ou lentidão.
- **Transições Suaves**:
  - Aceleração/Desaceleração: Curvas `cubic-bezier(0.16, 1, 0.3, 1)` (desaceleração natural).
  - Duração: 180ms a 280ms para botões, inputs, abas e diálogos.
  - Efeito Hover Elevado: Leve elevação tátil (`hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`).
- **Micro-animações de Confiança**:
  - Escudo de segurança no cabeçalho com pulso luminoso muito subtil e compassado.
  - Linha do tempo de acompanhamento (`/track`): nós de estado com indicador pulsante tranquilo e preenchimento progressivo suave.
  - Feedback de cópia do Código de Rastreio e PIN: transição animada com ícone de visto (*Check*) e flash de confirmação relaxante.
- **Acessibilidade e Desempenho**:
  - Respeito integral por `@media (prefers-reduced-motion: reduce)` — desligando animações complexas automaticamente para utilizadores com sensibilidade vestibular.

### 2.3 Reforço de Confiança e Segurança Psicológica (Trust UX)
- **Portal Público (`/`, `/new-case`, `/track`)**:
  - Banner permanente superior com micro-ícone de cadeado: *"Garantia de Anonimato: Sem recolha de IP, cookies de rastreio ou dados pessoais"*.
  - No formulário de submissão (`/new-case`):
    - Cartão de dicas de privacidade contextualizadas com tom acolhedor de assistente social.
    - Indicador de "Anonimato Preservado" dinâmico conforme o preenchimento.
    - Botão de envio com estado de carregamento acolhedor ("A proteger o seu relato com criptografia...").
  - Na página de sucesso de submissão:
    - Cartão de resguardo do Código de Rastreio e PIN com destaque acolhedor, botão de download seguro ou impressão do comprovativo de acesso.
  - Botão de "Saída Rápida":
    - Visualmente destacado, mas integrado na paleta, com indicador de atalho de teclado (`Esc` ou clique único).
- **Backoffice Técnico (`/admin/*`)**:
  - Header com hierarquia visual relaxante, avatar do técnico humanizado e distintivo de departamento elegante.
  - Transição fluida entre abas de processos ("Todos", "Meu Departamento", "Atribuídos a Mim") com indicador visual deslizante.
  - Indicadores de estado e crachás com micro-pílulas com alto contraste legível (mínimo 4.5:1).

---

## 3. Plano de Implementação

1. **Tokens e Estilos Base (`app/globals.css`)**:
   - Definição de variáveis CSS de cores calmantes, curvas de aceleração `ease-calm` e classes utilitárias para sombras difusas (`shadow-calm`, `shadow-calm-lg`).
   - Configuração de `prefers-reduced-motion` no CSS global.
2. **Componentes Compartilhados de Confiança e Animação**:
   - Cabeçalho global (`components/navbar.tsx` ou similar): refinamento do emblema, selo de segurança com pulso relaxante e botão de Saída Rápida com feedback visual refinado.
   - Cartões com hover tátil e bordas subtis.
3. **Refinamento do Portal do Cidadão/Utente**:
   - Página inicial (`app/page.tsx`): hero com iluminação ambiente serena, tipografia espaçada e cartões explicativos sobre o anonimato com micro-ícones.
   - Página de Submissão (`app/new-case/page.tsx`): campos de formulário acolhedores, transição fluida entre etapas e modal de confirmação do código HB.
   - Página de Consulta (`app/track/page.tsx`): linha de progresso animada, chat anónimo com balões de mensagem estilizados e confortáveis para leitura prolongada.
4. **Refinamento do Backoffice Administrativo**:
   - Dashboard (`app/admin/dashboard/page.tsx`): transições suaves nos filtros, contadores com fade elegante e estados de carregamento tipo skeleton.
   - Detalhe do Caso (`app/admin/cases/[id]/page.tsx`): modal de encaminhamento com micro-animação de abertura `scale-95 -> scale-100` e notas internas com visual profissional e limpo.
5. **Testes e Validação**:
   - Execução da suite de testes automatizados (`npm test`).
   - Verificação de linters e build de produção (`npm run build`).
   - Reconstrução do contentor Docker e validação no navegador.

---

## 4. Critérios de Aceitação

- [ ] Todas as páginas exibem uma paleta coerente com tons de Deep Teal, Sage e Warm Slate, eliminando contrastes rudes ou cores de pânico.
- [ ] Elementos interativos (botões, seletores, cards, abas) possuem transições suaves de 200ms com curva natural.
- [ ] Usuários com `prefers-reduced-motion` ativo não experienciam animações de deslocamento ou pulso.
- [ ] Mensagens de privacidade, anonimato e saída rápida transmitem tranquilidade e clareza imediata.
- [ ] Todos os testes unitários (`npm test`) continuam verdes (100% passados).
- [ ] O build de produção Next.js conclui com 0 erros de compilação ou TypeScript.
- [ ] O contentor Docker é reconstruído e reflete a nova identidade visual.
