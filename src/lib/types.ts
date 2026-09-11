/**
 * Tipos centrais do domínio do jogo.
 * Espelham as tabelas definidas em supabase/migrations/0001_init.sql.
 */

export type StatusSala = "aguardando" | "sorteando" | "linha_fechada" | "finalizada";

export type TipoVitoria = "linha" | "coluna" | "cartela_cheia";

export interface Tema {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  criadoEm: string;
}

export interface ItemTema {
  id: string;
  temaId: string;
  rotulo: string;
}

export interface Sala {
  id: string;
  codigo: string;
  temaId: string;
  tamanhoCartela: number; // ex: 5 -> grade 5x5
  status: StatusSala;
  hostSessionId: string;
  criadaEm: string;
}

export interface Jogador {
  id: string;
  salaId: string;
  sessionId: string;
  apelido: string;
  entrouEm: string;
}

/** Cartela de um jogador: itens distribuídos aleatoriamente na grade. */
export interface Cartela {
  id: string;
  jogadorId: string;
  salaId: string;
  /** IDs de ItemTema na ordem da grade, linha a linha (tamanho = tamanhoCartela^2) */
  itens: string[];
  /** IDs de ItemTema já marcados pelo jogador */
  marcados: string[];
}

/** Um item sorteado pelo sistema e transmitido a todos da sala. */
export interface Sorteio {
  id: string;
  salaId: string;
  itemTemaId: string;
  ordem: number;
  sorteadoEm: string;
}

export interface Vitoria {
  id: string;
  salaId: string;
  jogadorId: string;
  tipo: TipoVitoria;
  alcancadaEm: string;
}
