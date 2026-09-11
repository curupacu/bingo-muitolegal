-- Sprint 4: registrar e transmitir vitórias (linha / cartela cheia).
create policy "vitorias: qualquer um pode inserir" on vitorias
  for insert with check (true);

alter publication supabase_realtime add table vitorias;
