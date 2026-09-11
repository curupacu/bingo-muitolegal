"use client";

import { useEffect, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

interface JogadorEntrouPayload {
  id: string;
  apelido: string;
}

interface EventosSala {
  aoEntrarJogador?: (jogador: JogadorEntrouPayload) => void;
  aoAtualizarStatus?: (status: string) => void;
}

/**
 * Assina o canal Realtime da sala: novos jogadores entrando (INSERT em
 * `jogadores`) e mudanças de status da sala (UPDATE em `salas`), refletidos
 * pra todo mundo na sala sem precisar dar refresh.
 *
 * `eventos` pode ser passado inline a cada render — os callbacks ficam num
 * ref, então o canal só reabre quando `salaId` muda de verdade.
 */
export function useRoomChannel(
  supabase: SupabaseClient,
  salaId: string | null,
  eventos: EventosSala
) {
  const eventosRef = useRef(eventos);

  useEffect(() => {
    eventosRef.current = eventos;
  });

  useEffect(() => {
    if (!salaId) return;

    const canal = supabase
      .channel(`sala:${salaId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "jogadores",
          filter: `sala_id=eq.${salaId}`,
        },
        (payload) => {
          const linha = payload.new as { id: string; apelido: string };
          eventosRef.current.aoEntrarJogador?.({ id: linha.id, apelido: linha.apelido });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "salas",
          filter: `id=eq.${salaId}`,
        },
        (payload) => {
          const linha = payload.new as { status: string };
          eventosRef.current.aoAtualizarStatus?.(linha.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [supabase, salaId]);
}
