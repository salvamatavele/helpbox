# Especificação Técnica: Redesenho de Layout no Estilo Telegram (Telegram UI Clone)

**Status:** Aguardando Aprovação  
**Data:** 20 de Outubro de 2026  
**Autor:** Antigravity (AI Pair Programmer)  
**Projeto:** Helpbox Moçambique  

---

## 1. Contexto e Motivação
O utilizador solicitou transformar o layout do Helpbox num clone visual e ergonómico do **Telegram** (Telegram Web/App), migrando a barra de navegação para a parte inferior (*bottom navigation bar*), integrando a estética de mensageiro instantâneo com balões de conversa, cabeçalho de chat com estado em tempo real, botão de ação flutuante (*FAB - Floating Action Button*) e arquitetura multi-coluna adaptativa.

---

## 2. Objetivos Principais
1. **Navegação Inferior (Bottom Navigation Bar):**
   - No telemóvel e ecrãs compactos, a barra de navegação fica fixada no rodapé (`bottom-0`), com ícones Telegram (*Conversas/Casos*, *Novo Relato*, *Rastreio*, *Apoio/Perfil*), distintivos de contagem e indicador ativo.
   - No desktop, manter a barra lateral ou cabeçalho superior elegante estilo Telegram Web (menu hambúrguer lateral recolhível + abas de contexto).

2. **Clone do Layout Telegram:**
   - **Cabeçalho Telegram:** Título do canal/caso, avatar circular, subtítulo de estado ("*Online - Assistência Social Ativa*" ou "*Encriptação e Anonimato Garantidos*"), e botões de ação (Saída Rápida, Idioma, Tema).
   - **Fundo Telegram (Chat Wallpaper):** Fundo suave com micro-padrão subtil relaxante (vetorial com opacidade suave) no ecrã de mensagens e rastreio.
   - **Balões de Mensagem (Chat Bubbles):**
     - Mensagens do Denunciante: Alinhadas à direita, balão azul Telegram / ciano relaxante, cantos arredondados assimétricos com cauda (*tail*), hora e duplo visto (`✓✓`).
     - Respostas dos Técnicos: Alinhadas à esquerda, balão branco/slate suave, selo oficial do técnico/departamento, hora e estado.
   - **Barra de Entrada de Mensagem (Telegram Pill Bar):**
     - Campo arredondado estilo pílula com ícone de anexos (clip), campo de texto e botão circular de envio.
   - **Botão Flutuante de Ação (Telegram FAB):**
     - Botão circular azul no canto inferior direito com ícone de caneta/adicionar para submeter novo relato instantâneo.

3. **Salvaguarda Ética e de Anonimato:**
   - O botão de **Saída Rápida (Esc)** mantém-se acessível com 1 toque no cabeçalho superior em todos os ecrãs.
   - Indicadores visuais de anonimato ativo e resguardo de credenciais permanecem evidentes.

---

## 3. Arquitetura e Componentes Propostos

### 3.1 Novos Componentes
- `components/telegram/telegram-bottom-nav.tsx`:
  - Barra inferior fixa (`fixed bottom-0 z-40 w-full`) com suporte para *safe-area* de dispositivos móveis.
  - Abas:
    1. **Início / Geral** (`/`)
    2. **Novo Relato** (`/new-case`)
    3. **Consultar Caso** (`/track`)
    4. **Painel Técnico** (`/admin/dashboard` ou `/admin/login`)
  - Badges animados para notificações não lidas.
- `components/telegram/telegram-header.tsx`:
  - Cabeçalho minimalista Telegram com avatar do Helpbox, indicador de presença "Anonimato Ativo", botão de Saída Rápida e alternador de idioma.
- `components/telegram/telegram-fab.tsx`:
  - Botão flutuante no canto inferior direito para abertura imediata do formulário de novo caso.

### 3.2 Atualização de Ecrãs Existentes
- `app/layout.tsx` / `components/navbar.tsx`:
  - Adaptar a navegação para alternar automaticamente: barra inferior no telemóvel e visual Telegram Web no desktop, com espaçamento inferior (`pb-16` / `pb-20`) para não cobrir conteúdos.
- `app/track/page.tsx`:
  - Redesenhar a interface de consulta de caso e histórico de mensagens para o padrão autêntico de chat Telegram com balões, linha de tempo e barra de resposta rápida.
- `app/admin/cases/[id]/page.tsx`:
  - Apresentar a linha de tempo do caso, notas e mensagens no estilo Telegram multi-coluna (painel esquerdo com dados do caso e encaminhamentos; painel direito com histórico de conversa e notas internas).
- `app/globals.css`:
  - Classes utilitárias `.telegram-bubble-in`, `.telegram-bubble-out`, `.telegram-wallpaper`, `.telegram-fab-shadow`.

---

## 4. Critérios de Aceitação
1. [ ] A barra de navegação fica fixada no fundo no telemóvel e ecrãs compactos com ícones de estilo Telegram.
2. [ ] O ecrã de acompanhamento de caso (`/track`) e mensagens tem balões de chat Telegram com hora e visto duplo (`✓✓`).
3. [ ] Existe um Botão de Ação Flutuante (FAB) visível e funcional para iniciar um novo caso rapidamente.
4. [ ] O cabeçalho apresenta o avatar, estado "Online / Seguro" e o botão de Saída Rápida permanece 100% funcional.
5. [ ] Todos os textos estão traduzidos em Português (Moçambique) e Inglês com paridade total.
6. [ ] A suite de testes (`npm test`) passa com sucesso (100% green).
7. [ ] O container Docker compila e executa sem erros em `http://localhost:3004`.
