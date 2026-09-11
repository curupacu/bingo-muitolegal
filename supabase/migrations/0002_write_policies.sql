-- Sprint 1: libera as escritas necessárias para criar sala e entrar em sala
-- de forma anônima (sem login). Sorteios e vitórias continuam sem policy de
-- insert por enquanto — entram no Sprint 3/4, quando definirmos se a escrita
-- vem do client ou de uma rota server-side dedicada.

create policy "salas: qualquer um pode criar" on salas
  for insert with check (true);

create policy "jogadores: qualquer um pode entrar" on jogadores
  for insert with check (true);

create policy "cartelas: qualquer um pode criar a propria" on cartelas
  for insert with check (true);
