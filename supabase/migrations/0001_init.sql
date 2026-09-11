-- Bingo Temático — schema inicial
-- Convenção: nomes de tabela/coluna em português para bater com o domínio do jogo.

create extension if not exists "pgcrypto";

-- Um tema (ex: "Banco de Dados") agrupa o banco de itens usado nas cartelas.
create table temas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  descricao text,
  criado_em timestamptz not null default now()
);

-- Itens possíveis de um tema (o que pode cair nas casas da cartela).
create table itens_tema (
  id uuid primary key default gen_random_uuid(),
  tema_id uuid not null references temas (id) on delete cascade,
  rotulo text not null,
  unique (tema_id, rotulo)
);

create table salas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  tema_id uuid not null references temas (id),
  tamanho_cartela int not null default 5 check (tamanho_cartela between 3 and 6),
  status text not null default 'aguardando'
    check (status in ('aguardando', 'sorteando', 'linha_fechada', 'finalizada')),
  host_session_id text not null,
  criada_em timestamptz not null default now()
);

create table jogadores (
  id uuid primary key default gen_random_uuid(),
  sala_id uuid not null references salas (id) on delete cascade,
  session_id text not null,
  apelido text not null,
  entrou_em timestamptz not null default now(),
  unique (sala_id, session_id)
);

-- Cartela de um jogador: grade de itens_tema.id (tamanho_cartela² posições)
-- e o conjunto de itens já marcados.
create table cartelas (
  id uuid primary key default gen_random_uuid(),
  jogador_id uuid not null unique references jogadores (id) on delete cascade,
  sala_id uuid not null references salas (id) on delete cascade,
  itens uuid[] not null,
  marcados uuid[] not null default '{}'
);

-- Sequência de itens sorteados pelo sistema e transmitidos à sala.
create table sorteios (
  id uuid primary key default gen_random_uuid(),
  sala_id uuid not null references salas (id) on delete cascade,
  item_tema_id uuid not null references itens_tema (id),
  ordem int not null,
  sorteado_em timestamptz not null default now(),
  unique (sala_id, item_tema_id),
  unique (sala_id, ordem)
);

create table vitorias (
  id uuid primary key default gen_random_uuid(),
  sala_id uuid not null references salas (id) on delete cascade,
  jogador_id uuid not null references jogadores (id) on delete cascade,
  tipo text not null check (tipo in ('linha', 'coluna', 'cartela_cheia')),
  alcancada_em timestamptz not null default now()
);

create index on itens_tema (tema_id);
create index on jogadores (sala_id);
create index on sorteios (sala_id, ordem);
create index on vitorias (sala_id, tipo);

-- RLS: leitura pública dentro da sala é liberada (mvp anônimo, sem contas).
-- Escrita passa por policies restritas — refinar no Sprint 1 quando o fluxo
-- de criação/entrada em sala estiver implementado.
alter table temas enable row level security;
alter table itens_tema enable row level security;
alter table salas enable row level security;
alter table jogadores enable row level security;
alter table cartelas enable row level security;
alter table sorteios enable row level security;
alter table vitorias enable row level security;

create policy "temas: leitura publica" on temas for select using (true);
create policy "itens_tema: leitura publica" on itens_tema for select using (true);
create policy "salas: leitura publica" on salas for select using (true);
create policy "jogadores: leitura publica" on jogadores for select using (true);
create policy "cartelas: leitura publica" on cartelas for select using (true);
create policy "sorteios: leitura publica" on sorteios for select using (true);
create policy "vitorias: leitura publica" on vitorias for select using (true);
