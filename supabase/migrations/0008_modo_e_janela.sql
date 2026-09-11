-- Sprint 6: modo de jogo (sorteio clássico vs observação ao vivo, tipo a
-- banca de TCC) e janela de data/hora opcional pra eventos que duram mais
-- de um dia (a cartela do jogador já persiste sozinha via session_id).

alter table salas
  add column modo text not null default 'sorteio'
    check (modo in ('sorteio', 'observacao'));

alter table salas
  add column abre_em timestamptz,
  add column fecha_em timestamptz;
