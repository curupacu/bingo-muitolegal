# Bingo Temático

🔗 **[bingo-muitolegal.vercel.app](https://bingo-muitolegal.vercel.app)**

Bingo multiplayer em tempo real: o host cria uma sala escolhendo um tema
(ex: "Banco de Dados"), cada jogador entra com um apelido e recebe uma
cartela com itens do tema sorteados em posições aleatórias. O sistema vai
sorteando itens um a um; quem fecha uma linha primeiro faz "bingo de
linha", e quem fecha a cartela toda primeiro vence a partida.

As regras completas estão em [docs/REGRAS_DO_JOGO.md](./docs/REGRAS_DO_JOGO.md)
e o plano de desenvolvimento em [docs/SPRINTS.md](./docs/SPRINTS.md).

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) (Postgres + Realtime) como backend
- Deploy na [Vercel](https://vercel.com)

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # preencha com as chaves do seu projeto Supabase
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Banco de dados (Supabase)

O schema fica em `supabase/migrations/0001_init.sql`, com dados de exemplo
em `supabase/seed.sql`. Com a [CLI do Supabase](https://supabase.com/docs/guides/cli)
instalada:

```bash
supabase start          # sobe o Supabase localmente (Docker)
supabase db reset        # aplica migrations + seed
```

Ou aplique o SQL diretamente em um projeto na nuvem pelo painel do
Supabase (SQL Editor).

## Estrutura de pastas

```
src/
  app/                  # rotas (App Router)
    page.tsx            # home
    criar/               # criar sala
    sala/[codigo]/       # sala / tela do jogo
  components/
    ui/                  # componentes shadcn/ui (gerados, não editar à mão)
    bingo/               # componentes específicos do jogo
  lib/
    types.ts             # tipos de domínio (Sala, Jogador, Cartela, ...)
    game/                 # lógica pura do jogo (gerar cartela, checar vitória)
    supabase/             # clientes Supabase (browser e servidor)
  hooks/                 # hooks compartilhados (ex: canal realtime da sala)
supabase/
  migrations/             # schema do banco versionado
  seed.sql                # dados de exemplo (temas/itens)
docs/
  SPRINTS.md              # plano de desenvolvimento
  REGRAS_DO_JOGO.md        # regras do jogo, por escrito
```

## Deploy

No ar em [bingo-muitolegal.vercel.app](https://bingo-muitolegal.vercel.app),
conectado ao repositório — todo `git push` pra `main` publica uma nova
versão automaticamente. Variáveis de ambiente configuradas em
*Project Settings → Environment Variables* na Vercel (mesmas do
`.env.example`).
