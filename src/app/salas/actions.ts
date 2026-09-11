"use server";

import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import { gerarCartela } from "@/lib/game/gerar-cartela";
import { gerarCodigoSala } from "@/lib/game/gerar-codigo-sala";
import type { ItemTema } from "@/lib/types";

const TENTATIVAS_CODIGO = 6;
const TAMANHOS_VALIDOS = [3, 4, 5, 6];

export interface ResultadoAcaoSala {
  ok: boolean;
  erro?: string;
  codigo?: string;
}

type ClienteSupabase = Awaited<ReturnType<typeof criarClienteSupabaseServidor>>;

async function buscarItensDoTema(
  supabase: ClienteSupabase,
  temaId: string
): Promise<ItemTema[]> {
  const { data, error } = await supabase
    .from("itens_tema")
    .select("id, rotulo")
    .eq("tema_id", temaId);

  if (error) throw error;

  return (data ?? []).map((linha) => ({
    id: linha.id,
    temaId,
    rotulo: linha.rotulo,
  }));
}

/** Cria o jogador e a cartela dele para uma sala já existente. */
async function entrarComoJogador(
  supabase: ClienteSupabase,
  params: { salaId: string; temaId: string; tamanho: number; apelido: string; sessionId: string }
) {
  const itens = await buscarItensDoTema(supabase, params.temaId);

  if (itens.length < params.tamanho * params.tamanho) {
    return {
      ok: false as const,
      erro: `Esse tema só tem ${itens.length} itens cadastrados — não dá pra montar uma cartela ${params.tamanho}x${params.tamanho} (precisa de ${params.tamanho * params.tamanho}).`,
    };
  }

  const { data: jogador, error: erroJogador } = await supabase
    .from("jogadores")
    .insert({
      sala_id: params.salaId,
      session_id: params.sessionId,
      apelido: params.apelido,
    })
    .select("id")
    .single();

  if (erroJogador || !jogador) {
    return { ok: false as const, erro: "Não deu pra entrar na sala. Tenta de novo." };
  }

  const cartela = gerarCartela(itens, params.tamanho);

  const { error: erroCartela } = await supabase.from("cartelas").insert({
    jogador_id: jogador.id,
    sala_id: params.salaId,
    itens: cartela.map((item) => item.id),
    marcados: [],
  });

  if (erroCartela) {
    return { ok: false as const, erro: "Não deu pra gerar sua cartela. Tenta de novo." };
  }

  return { ok: true as const };
}

export async function criarSala(input: {
  temaSlug: string;
  tamanho: number;
  apelido: string;
  sessionId: string;
}): Promise<ResultadoAcaoSala> {
  const apelido = input.apelido.trim();

  if (!apelido) return { ok: false, erro: "Escreve um apelido." };
  if (!input.sessionId) return { ok: false, erro: "Sessão inválida — recarregue a página." };
  if (!TAMANHOS_VALIDOS.includes(input.tamanho)) {
    return { ok: false, erro: "Tamanho de cartela inválido." };
  }

  const supabase = await criarClienteSupabaseServidor();

  const { data: tema, error: erroTema } = await supabase
    .from("temas")
    .select("id")
    .eq("slug", input.temaSlug)
    .single();

  if (erroTema || !tema) {
    return { ok: false, erro: "Tema não encontrado." };
  }

  let salaId: string | null = null;
  let codigoGerado: string | null = null;

  for (let tentativa = 0; tentativa < TENTATIVAS_CODIGO; tentativa++) {
    const candidato = gerarCodigoSala();
    const { data: sala, error: erroSala } = await supabase
      .from("salas")
      .insert({
        codigo: candidato,
        tema_id: tema.id,
        tamanho_cartela: input.tamanho,
        host_session_id: input.sessionId,
      })
      .select("id, codigo")
      .single();

    if (!erroSala && sala) {
      salaId = sala.id;
      codigoGerado = sala.codigo;
      break;
    }

    // 23505 = unique_violation (código já em uso) — tenta outro código.
    if (erroSala && erroSala.code !== "23505") {
      return { ok: false, erro: "Não deu pra criar a sala. Tenta de novo." };
    }
  }

  if (!salaId || !codigoGerado) {
    return { ok: false, erro: "Não deu pra gerar um código de sala livre. Tenta de novo." };
  }

  const resultado = await entrarComoJogador(supabase, {
    salaId,
    temaId: tema.id,
    tamanho: input.tamanho,
    apelido,
    sessionId: input.sessionId,
  });

  if (!resultado.ok) {
    // Sala já foi criada mas o host não conseguiu entrar — remove pra não sobrar lixo.
    await supabase.from("salas").delete().eq("id", salaId);
    return { ok: false, erro: resultado.erro };
  }

  return { ok: true, codigo: codigoGerado };
}

export async function entrarNaSala(input: {
  codigo: string;
  apelido: string;
  sessionId: string;
}): Promise<ResultadoAcaoSala> {
  const apelido = input.apelido.trim();
  const codigo = input.codigo.trim().toUpperCase();

  if (!apelido) return { ok: false, erro: "Escreve um apelido." };
  if (!input.sessionId) return { ok: false, erro: "Sessão inválida — recarregue a página." };
  if (!codigo) return { ok: false, erro: "Escreve o código da sala." };

  const supabase = await criarClienteSupabaseServidor();

  const { data: sala, error: erroSala } = await supabase
    .from("salas")
    .select("id, tema_id, tamanho_cartela")
    .eq("codigo", codigo)
    .maybeSingle();

  if (erroSala || !sala) {
    return { ok: false, erro: "Sala não encontrada. Confira o código." };
  }

  const { data: jogadorExistente } = await supabase
    .from("jogadores")
    .select("id")
    .eq("sala_id", sala.id)
    .eq("session_id", input.sessionId)
    .maybeSingle();

  if (jogadorExistente) {
    return { ok: true, codigo };
  }

  const resultado = await entrarComoJogador(supabase, {
    salaId: sala.id,
    temaId: sala.tema_id,
    tamanho: sala.tamanho_cartela,
    apelido,
    sessionId: input.sessionId,
  });

  if (!resultado.ok) {
    return { ok: false, erro: resultado.erro };
  }

  return { ok: true, codigo };
}
