-- Permite remover uma sala (usado quando a criação falha depois de já ter
-- inserido a sala — ex: tema sem itens suficientes — pra não deixar lixo).
create policy "salas: qualquer um pode deletar" on salas
  for delete using (true);
