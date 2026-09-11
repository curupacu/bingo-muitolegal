import type { TipoVitoria } from "@/lib/types";

export interface ResultadoVerificacao {
  venceu: boolean;
  tipo: TipoVitoria | null;
}

/**
 * Verifica se a cartela do jogador bateu linha, coluna ou cartela cheia.
 *
 * `itens` é a grade linha a linha (tamanho = lado²) e `marcados` é o
 * conjunto de ids já sorteados/marcados. A checagem de coluna existe
 * para dar mais formas de vitória além da linha horizontal clássica.
 */
export function verificarVitoria(
  itens: string[],
  marcados: Set<string>,
  lado: number
): ResultadoVerificacao {
  const grade: string[][] = [];
  for (let linha = 0; linha < lado; linha++) {
    grade.push(itens.slice(linha * lado, linha * lado + lado));
  }

  const cartelaCheia = itens.every((id) => marcados.has(id));
  if (cartelaCheia) {
    return { venceu: true, tipo: "cartela_cheia" };
  }

  const temLinhaCompleta = grade.some((linha) => linha.every((id) => marcados.has(id)));
  if (temLinhaCompleta) {
    return { venceu: true, tipo: "linha" };
  }

  for (let coluna = 0; coluna < lado; coluna++) {
    const completa = grade.every((linha) => marcados.has(linha[coluna]));
    if (completa) {
      return { venceu: true, tipo: "coluna" };
    }
  }

  return { venceu: false, tipo: null };
}
