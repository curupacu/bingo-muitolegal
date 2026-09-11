-- Sprint 2: liga jogadores entrando e mudanças de status da sala ao
-- Realtime, pra sala atualizar sozinha sem precisar de refresh.
alter publication supabase_realtime add table jogadores;
alter publication supabase_realtime add table salas;
