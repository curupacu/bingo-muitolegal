"use client";

import { useEffect, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

interface JogadorEntrouPayload {
  id: string;
  apelido: string;
}

interface ItemSorteadoPayload {
  itemTemaId: string;
  ordem: number;
}

interface VitoriaPayload {
  jogadorId: string;
  tipo: string;
}

interface EventosSala {
  aoEntrarJogador?: (jogador: JogadorEntrouPayload) => void;
  aoAtualizarStatus?: (status: string) => void;
  aoSortear?: (item: ItemSorteadoPayload) => void;
  aoVencer?: (vitoria: VitoriaPayload) => void;
}

/**
 * Assina o canal Realtime da sala: novos jogadores entrando (INSERT em
 * `jogadores`), mudanças de status da sala (UPDATE em `salas`), novos
 * itens sorteados (INSERT em `sorteios`) e vitórias (INSERT em `vitorias`),
 * refletidos pra todo mundo na sala sem precisar dar refresh.
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
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sorteios",
          filter: `sala_id=eq.${salaId}`,
        },
        (payload) => {
          const linha = payload.new as { item_tema_id: string; ordem: number };
          eventosRef.current.aoSortear?.({ itemTemaId: linha.item_tema_id, ordem: linha.ordem });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "vitorias",
          filter: `sala_id=eq.${salaId}`,
        },
        (payload) => {
          const linha = payload.new as { jogador_id: string; tipo: string };
          eventosRef.current.aoVencer?.({ jogadorId: linha.jogador_id, tipo: linha.tipo });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [supabase, salaId]);
}
