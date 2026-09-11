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

## Sprint 2 — Tempo real (sala ao vivo) — concluído

**Objetivo:** todo mundo na sala vê os outros jogadores entrando, ao vivo.

- [x] Canal Supabase Realtime por sala (`sala:{codigo_da_sala_id}`), via
      Postgres Changes — tabelas `jogadores` e `salas` adicionadas à
      publicação `supabase_realtime` (`supabase/migrations/0004_realtime.sql`)
- [x] Lista de jogadores atualiza sozinha quando alguém entra (INSERT em
      `jogadores`, com dedup por id pra não duplicar o próprio jogador)
- [x] Status da sala (aguardando / sorteando / etc.) refletido em tempo real
      pra todos (UPDATE em `salas`)
- [x] `useRoomChannel` implementado de verdade em
      `src/hooks/use-room-channel.ts`

**Critério de pronto:** ✅ testado com duas abas (sessões distintas) — a
aba da Ana mostrou o João entrando e o status da sala mudando pra
"Sorteio em andamento", sem nenhum reload.

---

## Sprint 3 — Sorteio e marcação — concluído

**Objetivo:** o jogo em si — sorteio automático e cada um marcando sua
cartela.

- [x] Mecanismo de sorteio: sistema sorteia o próximo item do tema (sem
      repetir) e grava em `sorteios` (`sortearProximoItem` em
      `src/app/salas/actions.ts`)
- [x] Broadcast do sorteio pro canal da sala em tempo real (evento
      `aoSortear` em `useRoomChannel`)
- [x] Painel "Sorteio" mostra o item atual + histórico dos já sorteados
- [x] Jogador marca a casa da cartela clicando nela — só funciona em itens
      já sorteados (atualiza `cartelas.marcados` via `marcarItemCartela`)
- [x] Ritmo do sorteio decidido: **host controla o ritmo** com um botão
      "Sortear próximo" — ele não escolhe qual item sai (isso é sempre
      aleatório no servidor), só quando o próximo é revelado. Fica livre
      pra ler o item em voz alta e dar tempo da turma marcar antes de
      seguir. Documentado em
      [REGRAS_DO_JOGO.md](./REGRAS_DO_JOGO.md#pontos-em-aberto-decidirtestar-depois)

**Critério de pronto:** ✅ testado com duas sessões — a Ana (host) sorteou
3 itens pelo botão, o status virou "Sorteio em andamento", o João (não
host, sem o botão) viu cada sorteio aparecer ao vivo sem reload — inclusive
o histórico já sorteado ao entrar no meio do jogo — e marcar uma casa
persistiu corretamente no banco.

**Bug achado e corrigido nesse sprint:** faltava policy de UPDATE em
`salas`, então a mudança de status pra "sorteando" era bloqueada
silenciosamente pelo RLS (`0006_update_salas.sql`).

**Limitação conhecida:** o controle de quem pode sortear é só de UI (o
botão some pra quem não é host) — a policy do banco não impede outra
sessão de chamar a ação diretamente. Aceitável pro modelo de confiança
desse MVP (sala de aula, sem contas); revisar se o jogo sair desse
contexto.

---

## Sprint 4 — Vitória — concluído

**Objetivo:** o jogo sabe dizer quem ganhou, e quando.

- [x] `verificarVitoria` checado a cada marcação (server-side, dentro de
      `marcarItemCartela`)
- [x] Suporta múltiplos vencedores de "linha" (jogo não para na primeira —
      cada jogador só registra uma vez por tipo, mas vários podem vencer)
- [x] Vitórias gravadas em `vitorias`, tipo `linha` ou `cartela_cheia`
      (coluna normalizada pra "linha" — só essas duas categorias foram
      definidas nas regras, ver `verificarVitoria`)
- [x] Toast anunciando o vencedor em tempo real pra sala toda (evento
      `aoVencer` em `useRoomChannel`)
- [x] Painel "Vencedores" (inline, sem tela separada) lista quem já fechou
      linha e quem já fez cartela cheia — some quando não há vencedores
      ainda
- [x] Sala vai pra `linha_fechada` no primeiro bingo de linha e
      `finalizada` na cartela cheia; sorteio trava (host não sorteia mais)
      quando finalizada

**Critério de pronto:** ✅ testado uma partida completa 3x3 do início ao
fim: bati linha (toast + painel de vencedores atualizou, status virou
"Linha fechada"), depois cartela cheia (toast + status "Finalizada" +
botão de sortear virou "Jogo encerrado"). Conferido também direto no banco
que as vitórias gravaram certo.

---

## Sprint 5 — Polimento e deploy — concluído

**Objetivo:** pronto pra usar de verdade com uma turma, no celular.

- [x] Responsivo — achei e corrigi um bug real testando no celular: a
      cartela 5x5 ficava com o texto praticamente cortado nas bordas das
      casas (ver `src/components/bingo/cartela.tsx`) — casas não são mais
      quadradas forçadas no mobile, crescem em altura pra caber o texto
- [ ] Feedback visual/sonoro leve ao marcar item e ao anunciar vitória —
      ainda não (o toast de vitória do Sprint 4 já cobre um pouco disso;
      som fica pra depois se fizer falta)
- [x] Estados vazios e de erro tratados: sala não encontrada, tema sem
      itens suficientes, e agora também sala já finalizada (jogador que
      entra depois do fim vê aviso em vez de simplesmente jogar sem
      sentido)
- [x] Supabase em produção — o projeto `bingo-muitolegal` usado desde o
      Sprint 1 já é o de produção, não tem um ambiente de dev separado
      nesse MVP
- [x] **Deploy na Vercel** — 🔗 **https://bingo-muitolegal.vercel.app**
      Projeto conectado ao repo (`curupacu/bingo-muitolegal`, branch
      `main`), variáveis de ambiente configuradas, testado em produção
      criando uma sala de verdade (cartela gerada, Supabase respondendo
      client e server-side). Todo `git push` pra `main` publica sozinho
      daqui pra frente.
- [ ] Teste real com uma turma — próximo passo agora que o link existe

**Critério de pronto:** ✅ link público no ar, testado criando sala e
gerando cartela em produção.

---

## Sprint 6 — Modo observação e eventos de vários dias — concluído

**Objetivo:** suportar o tema "Banca de TCC" — mecânica diferente (sem
sorteio) e um evento que atravessa dois dias.

Motivado por feedback real de uso: os temas de sorteio precisam de mais
itens que o tamanho da cartela pra dar a emoção de um bingo de verdade
(já funcionava, só faltava deixar claro), e o tema da banca de TCC (com
uma banca de protótipos segunda e terça) não é um sorteio — são coisas
que os professores/algo vai fazer, cada jogador marca o que presencia.

- [x] **Modo "observação"**: nova coluna `salas.modo`
      (`sorteio` | `observacao`). No modo observação não existe sorteio —
      toda casa da cartela já fica liberada pra marcar assim que o
      jogador entra; a detecção de linha/cartela cheia é a mesma lógica
      de sempre, só muda como a casa fica "disponível"
  - Painel "Sorteio" vira um painel "Como jogar" nesse modo (sem botão de
    host, sem histórico de sorteio)
- [x] **Janela de data/hora opcional** (`abre_em` / `fecha_em`): sala
      pode ter um período definido (ex: segunda 13h30 até terça 19h).
      Fora da janela, a sala mostra um aviso em vez do jogo ("ainda não
      abriu" / "já encerrou") — o host também não consegue mais sortear
      depois do fechamento
- [x] **Persistência entre dias**: decidido manter sessão anônima por
      `localStorage` (sem login) — já funciona sozinho pro caso comum
      (mesmo aparelho nos dois dias). Documentado o limite (trocar de
      aparelho perde a cartela) em
      [REGRAS_DO_JOGO.md](./REGRAS_DO_JOGO.md#pontos-em-aberto-decidirtestar-depois)
- [x] Tela de criar sala ganhou seletor de modo e campos opcionais de
      data/hora

**Bug achado e corrigido nesse sprint:** no modo observação a sala nunca
saía do status "aguardando" — a transição pra "linha fechada" só
verificava o status `sorteando`, que esse modo nunca atinge (não tem
sorteio pra disparar isso). Também achei que o botão de sortear
continuava clicável mesmo depois do prazo (`fecha_em`) vencido — os dois
corrigidos e testados.

**Critério de pronto:** ✅ testado modo observação do início ao fim (linha
batida sem nenhum sorteio, status certo), e testado a janela de data nos
dois estados (antes de abrir / depois de fechar) manipulando o horário
direto no banco.

---

## Backlog (pós-MVP, não bloqueia o lançamento)

- Login opcional (histórico de partidas por usuário)
- Tela de admin pra cadastrar temas/itens sem mexer em SQL
- Cartela com tamanho adaptado automaticamente ao nº de itens do tema
- Modo "host controla o ritmo do sorteio" manualmente
- Temas/itens sugeridos por IA a partir de um assunto
