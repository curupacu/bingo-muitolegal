# Plano de desenvolvimento — Bingo Temático

Plano de alto nível em sprints. Cada sprint é pensado pra terminar com algo
jogável/demonstrável, não só código solto. Duração é sugestão (ajuste
conforme o tempo disponível) — o importante é a ordem e o critério de
"pronto" de cada um.

## Stack escolhida

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript | Full-stack em um projeto só, deploy nativo na Vercel |
| UI | Tailwind CSS v4 + shadcn/ui | Componentes acessíveis, visual consistente, fácil de deixar bonito rápido |
| Backend / dados | Supabase (Postgres + Realtime) | Banco relacional real + canais de tempo real prontos, sem precisar manter um servidor WebSocket separado |
| Deploy | Vercel | Pedido do time, integra bem com Next.js |
| Sessão do jogador | Anônima (id de sessão em cookie/localStorage) | MVP sem login, conforme decidido |

Estrutura de pastas já criada — ver [README.md](../README.md#estrutura-de-pastas).

---

## Sprint 0 — Fundação (concluído)

**Objetivo:** ter um esqueleto navegável e a base técnica pronta pra sprints
seguintes não serem "configurar coisa", e sim "fazer o jogo funcionar".

- [x] Projeto Next.js + TypeScript + Tailwind + shadcn/ui
- [x] Estrutura de pastas (`app`, `components`, `lib`, `hooks`, `supabase`, `docs`)
- [x] Tipos de domínio (`src/lib/types.ts`)
- [x] Lógica pura de jogo: gerar cartela e verificar vitória (com testes a
      escrever no Sprint 1)
- [x] Setup do cliente Supabase (browser + servidor)
- [x] Schema inicial do banco (`supabase/migrations/0001_init.sql`) + seed de
      exemplo
- [x] Protótipo visual clicável: Home → Criar sala → Sala (sem persistência
      ainda)

**Critério de pronto:** `npm run dev` sobe o site, dá pra navegar pelas 3
telas, nada quebra.

---

## Sprint 1 — Salas de verdade (persistência) — concluído

**Objetivo:** criar e entrar em sala grava e lê do Supabase de verdade.

- [x] Projeto Supabase de dev provisionado (`bingo-muitolegal`, org
      `curupacu's Org`), migrations + seed aplicados
- [x] Código de sala único gerado (6 caracteres, sem 0/O/1/I/L ambíguos) —
      `src/lib/game/gerar-codigo-sala.ts`
- [x] Sessão anônima: `session_id` gerado e guardado em `localStorage` (ver
      `src/hooks/use-sessao-anonima.ts` — decidimos localStorage em vez de
      cookie httpOnly pra evitar a complexidade de middleware nesse MVP)
- [x] Tela "Criar sala" grava tema + tamanho + host no banco e redireciona
      pra `/sala/[codigo]` (`src/app/salas/actions.ts` → `criarSala`)
- [x] `/sala/[codigo]` funciona como portão de entrada: se a sessão ainda
      não tem jogador ali, mostra formulário de apelido; ao entrar, cria
      `jogadores` + `cartelas` (`entrarNaSala`) e mostra a cartela real
- [x] Erros tratados: código inválido/sala não encontrada, tema sem itens
      suficientes pro tamanho de cartela (com limpeza da sala órfã se falhar
      depois de já ter sido criada)

**Critério de pronto:** ✅ testado manualmente — duas sessões diferentes
criam/entram na mesma sala (`U4DUX8`), cada uma com cartela própria e
distinta, lista de jogadores e sala persistidas no Supabase.

**Ainda não faz** (fica pro Sprint 2): a lista de jogadores não atualiza
sozinha — precisa dar refresh na página pra ver quem entrou depois de você.

---

## Sprint 2 — Tempo real (sala ao vivo)

**Objetivo:** todo mundo na sala vê os outros jogadores entrando, ao vivo.

- Canal Supabase Realtime por sala (`sala:{codigo}`)
- Lista de jogadores atualiza sozinha quando alguém entra (Presence ou
  Postgres Changes na tabela `jogadores`)
- Status da sala (aguardando / sorteando / finalizada) refletido em tempo
  real pra todos
- Implementar `useRoomChannel` (hoje é um stub em `src/hooks/use-room-channel.ts`)

**Critério de pronto:** abrir a sala em 3 abas mostra a lista de jogadores
sincronizada nas 3, sem precisar dar refresh.

---

## Sprint 3 — Sorteio e marcação

**Objetivo:** o jogo em si — sorteio automático e cada um marcando sua
cartela.

- Mecanismo de sorteio: sistema sorteia o próximo item do tema (sem repetir)
  e grava em `sorteios`
- Broadcast do sorteio pro canal da sala em tempo real
- Painel "Sorteio" mostra o item atual + histórico dos já sorteados
- Jogador marca a casa da cartela quando o item sorteado está nela
  (atualiza `cartelas.marcados`)
- Decidir e implementar o ritmo do sorteio (ver ponto em aberto em
  [REGRAS_DO_JOGO.md](./REGRAS_DO_JOGO.md))

**Critério de pronto:** partida jogável do início ao fim manualmente — dá
pra sortear todos os itens e ver as cartelas se preenchendo em tempo real
em mais de um dispositivo.

---

## Sprint 4 — Vitória

**Objetivo:** o jogo sabe dizer quem ganhou, e quando.

- Checar `verificarVitoria` a cada marcação
- Suportar múltiplos vencedores de "linha" (jogo não para na primeira
  linha)
- Registrar vitórias em `vitorias`, com o tipo (linha/coluna/cartela cheia)
- Banner/toast anunciando vencedores em tempo real pra sala toda
- Tela de fim de jogo quando a cartela cheia é batida (ranking de quem
  ganhou linha e quem ganhou a cartela)

**Critério de pronto:** partida completa jogada até o fim mostra os
vencedores corretos pra todos os participantes, sem precisar dar refresh.

---

## Sprint 5 — Polimento e deploy

**Objetivo:** pronto pra usar de verdade com uma turma, no celular.

- Responsivo (uso em sala de aula é majoritariamente celular)
- Feedback visual/sonoro leve ao marcar item e ao anunciar vitória
- Estados vazios e de erro tratados (sala não existe, sala cheia, etc.)
- Deploy Supabase em produção + variáveis de ambiente na Vercel
- Deploy do site na Vercel, domínio configurado
- Teste real com uma turma/sala e ajustes a partir do feedback

**Critério de pronto:** link público funcionando, testado com gente de
verdade jogando ao mesmo tempo.

---

## Backlog (pós-MVP, não bloqueia o lançamento)

- Login opcional (histórico de partidas por usuário)
- Tela de admin pra cadastrar temas/itens sem mexer em SQL
- Cartela com tamanho adaptado automaticamente ao nº de itens do tema
- Modo "host controla o ritmo do sorteio" manualmente
- Temas/itens sugeridos por IA a partir de um assunto
