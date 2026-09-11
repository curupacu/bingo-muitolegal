"use client";

/**
 * TODO (Sprint 2): hook que assina o canal Realtime da sala (`sala:{codigo}`)
 * via Supabase Broadcast/Postgres Changes e expõe:
 *  - lista de jogadores presentes (Presence)
 *  - itens já sorteados (tabela `sorteios`)
 *  - vitórias anunciadas (tabela `vitorias`)
 *
 * Mantido como stub para deixar visível onde a lógica de tempo real entra
 * na estrutura antes de implementarmos os sprints de jogo.
 */
export function useRoomChannel(codigoSala: string) {
  throw new Error(
    `useRoomChannel("${codigoSala}") ainda não implementado — ver docs/SPRINTS.md (Sprint 2).`
  );
}
