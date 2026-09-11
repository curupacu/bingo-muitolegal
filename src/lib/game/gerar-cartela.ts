import type { ItemTema } from "@/lib/types";

/**
 * Embaralha um array (Fisher-Yates) sem mutar o original.
 */
function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Gera a grade de itens de uma cartela para um jogador.
 *
 * Sorteia `tamanho x tamanho` itens do banco do tema e os embaralha
 * na grade, para que cada jogador tenha uma disposição diferente.
 *
 * Se o tema tiver menos itens que o necessário, lança erro — cabe à
 * tela de criação de sala impedir isso antes (tema precisa de pelo
 * menos tamanho² itens cadastrados).
 */
export function gerarCartela(itensDoTema: ItemTema[], tamanho: number): ItemTema[] {
  const necessarios = tamanho * tamanho;

  if (itensDoTema.length < necessarios) {
    throw new Error(
      `Tema tem ${itensDoTema.length} itens, mas a cartela ${tamanho}x${tamanho} precisa de ${necessarios}.`
    );
  }

  return embaralhar(itensDoTema).slice(0, necessarios);
}
