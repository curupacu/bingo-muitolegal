-- Faltava policy de update em `salas` — o status (aguardando -> sorteando)
-- estava sendo bloqueado silenciosamente pelo RLS.
create policy "salas: qualquer um pode atualizar" on salas
  for update using (true) with check (true);
