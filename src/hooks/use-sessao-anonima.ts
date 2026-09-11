"use client";

import { useState } from "react";

const CHAVE = "bingo:sessionId";

function obterOuCriarSessionId(): string | null {
  if (typeof window === "undefined") return null;

  const existente = localStorage.getItem(CHAVE);
  if (existente) return existente;

  const novo = crypto.randomUUID();
  localStorage.setItem(CHAVE, novo);
  return novo;
}

/**
 * Sessão anônima do jogador: um id gerado no navegador e guardado em
 * localStorage, sem login. É o que liga um jogador a um registro em
 * `jogadores`/`cartelas` entre visitas à mesma sala.
 *
 * Lido no inicializador do useState (não num effect) porque é uma leitura
 * síncrona de uma store externa — no servidor `window` não existe, então
 * cai pra `null` até o componente hidratar no navegador.
 */
export function useSessaoAnonima() {
  const [sessionId] = useState<string | null>(() => obterOuCriarSessionId());
  return sessionId;
}
