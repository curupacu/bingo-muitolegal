-- Sprint 3: sorteio de itens e marcação da cartela.

-- O sistema sorteia (host aciona, mas quem escolhe o item é o server action
-- via random no backend) — insert liberado como os demais, mesmo modelo de
-- confiança do MVP (sem contas).
create policy "sorteios: qualquer um pode inserir" on sorteios
  for insert with check (true);

-- Jogador marca a própria cartela conforme os itens vão sendo sorteados.
create policy "cartelas: qualquer um pode atualizar" on cartelas
  for update using (true) with check (true);

alter publication supabase_realtime add table sorteios;
