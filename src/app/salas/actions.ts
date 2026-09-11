"use server";

import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import { gerarCartela } from "@/lib/game/gerar-cartela";
import { gerarCodigoSala } from "@/lib/game/gerar-codigo-sala";
import { verificarVitoria } from "@/lib/game/verificar-vitoria";
import type { ItemTema } from "@/lib/types";

const TENTATIVAS_CODIGO = 6;
const TAMANHOS_VALIDOS = [3, 4, 5, 6];

export interface ResultadoAcaoSala {
  ok: boolean;
  erro?: string;
  codigo?: string;
}

export interface ResultadoSorteio {
  ok: boolean;
  erro?: string;
  item?: { id: string; rotulo: string };
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
  modo?: "sorteio" | "observacao";
  abreEm?: string | null;
  fechaEm?: string | null;
}): Promise<ResultadoAcaoSala> {
  const apelido = input.apelido.trim();
  const modo = input.modo ?? "sorteio";

  if (!apelido) return { ok: false, erro: "Escreve um apelido." };
  if (!input.sessionId) return { ok: false, erro: "Sessão inválida — recarregue a página." };
  if (!TAMANHOS_VALIDOS.includes(input.tamanho)) {
    return { ok: false, erro: "Tamanho de cartela inválido." };
  }
  if (modo !== "sorteio" && modo !== "observacao") {
    return { ok: false, erro: "Modo de jogo inválido." };
  }
  if (input.abreEm && input.fechaEm && new Date(input.abreEm) >= new Date(input.fechaEm)) {
    return { ok: false, erro: "A data de fim precisa ser depois da data de início." };
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
        modo,
        abre_em: input.abreEm ?? null,
        fecha_em: input.fechaEm ?? null,
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

/**
 * Sorteia o próximo item (sem repetir) e grava em `sorteios`. Só o host da
 * sala pode acionar — quem escolhe QUAL item sai é sempre aleatório aqui no
 * servidor, o host só controla O RITMO (clica quando quer revelar o
 * próximo, pra dar tempo de ler em voz alta e a galera marcar).
 */
export async function sortearProximoItem(input: {
  codigo: string;
  sessionId: string;
}): Promise<ResultadoSorteio> {
  const codigo = input.codigo.trim().toUpperCase();
  if (!input.sessionId) return { ok: false, erro: "Sessão inválida — recarregue a página." };

  const supabase = await criarClienteSupabaseServidor();

  const { data: sala, error: erroSala } = await supabase
    .from("salas")
    .select("id, tema_id, status, host_session_id, fecha_em")
    .eq("codigo", codigo)
    .maybeSingle();

  if (erroSala || !sala) {
    return { ok: false, erro: "Sala não encontrada." };
  }

  if (sala.host_session_id !== input.sessionId) {
    return { ok: false, erro: "Só quem criou a sala pode sortear." };
  }

  if (sala.fecha_em && new Date(sala.fecha_em) < new Date()) {
    return { ok: false, erro: "Essa sala já encerrou." };
  }

  const itens = await buscarItensDoTema(supabase, sala.tema_id);

  const { data: sorteados, error: erroSorteados } = await supabase
    .from("sorteios")
    .select("item_tema_id")
    .eq("sala_id", sala.id);

  if (erroSorteados) {
    return { ok: false, erro: "Não deu pra ver o histórico de sorteios. Tenta de novo." };
  }

  const idsSorteados = new Set((sorteados ?? []).map((s) => s.item_tema_id));
  const restantes = itens.filter((item) => !idsSorteados.has(item.id));

  if (restantes.length === 0) {
    return { ok: false, erro: "Todos os itens desse tema já foram sorteados." };
  }

  const escolhido = restantes[Math.floor(Math.random() * restantes.length)];
  const proximaOrdem = idsSorteados.size + 1;

  const { error: erroInsert } = await supabase.from("sorteios").insert({
    sala_id: sala.id,
    item_tema_id: escolhido.id,
    ordem: proximaOrdem,
  });

  if (erroInsert) {
    return { ok: false, erro: "Não deu pra sortear. Tenta de novo." };
  }

  if (sala.status === "aguardando") {
    await supabase.from("salas").update({ status: "sorteando" }).eq("id", sala.id);
  }

  return { ok: true, item: { id: escolhido.id, rotulo: escolhido.rotulo } };
}

/**
 * Marca ou desmarca um item na cartela do jogador. No modo "sorteio" só
 * deixa marcar item que já saiu no sorteio; no modo "observação" (ex: banca
 * de TCC) não tem sorteio nenhum — o jogador marca livremente o que
 * presenciou.
 */
export async function marcarItemCartela(input: {
  cartelaId: string;
  itemId: string;
  marcar: boolean;
}): Promise<ResultadoAcaoSala> {
  const supabase = await criarClienteSupabaseServidor();

  const { data: cartela, error: erroCartela } = await supabase
    .from("cartelas")
    .select("id, sala_id, jogador_id, itens, marcados")
    .eq("id", input.cartelaId)
    .single();

  if (erroCartela || !cartela) {
    return { ok: false, erro: "Cartela não encontrada." };
  }

  const { data: sala } = await supabase
    .from("salas")
    .select("modo")
    .eq("id", cartela.sala_id)
    .single();

  if (sala?.modo !== "observacao") {
    const { data: sorteado } = await supabase
      .from("sorteios")
      .select("id")
      .eq("sala_id", cartela.sala_id)
      .eq("item_tema_id", input.itemId)
      .maybeSingle();

    if (!sorteado) {
      return { ok: false, erro: "Esse item ainda não foi sorteado." };
    }
  }

  const marcadosAtuais = new Set<string>(cartela.marcados as string[]);
  if (input.marcar) {
    marcadosAtuais.add(input.itemId);
  } else {
    marcadosAtuais.delete(input.itemId);
  }

  const { error: erroUpdate } = await supabase
    .from("cartelas")
    .update({ marcados: Array.from(marcadosAtuais) })
    .eq("id", input.cartelaId);

  if (erroUpdate) {
    return { ok: false, erro: "Não deu pra marcar. Tenta de novo." };
  }

  if (input.marcar) {
    await registrarVitoriaSeAplicavel(supabase, {
      salaId: cartela.sala_id,
      jogadorId: cartela.jogador_id,
      itens: cartela.itens as string[],
      marcados: marcadosAtuais,
    });
  }

  return { ok: true };
}

/**
 * Depois de marcar um item, confere se essa cartela bateu linha/coluna ou
 * cartela cheia e, se for a primeira vez pra esse jogador nesse tipo,
 * grava em `vitorias`. Coluna conta como a mesma categoria de "linha" pras
 * regras do jogo (só linha e cartela cheia foram definidas com o dono do
 * produto) — normaliza aqui pra não complicar a UI com um terceiro tipo.
 */
async function registrarVitoriaSeAplicavel(
  supabase: ClienteSupabase,
  params: { salaId: string; jogadorId: string; itens: string[]; marcados: Set<string> }
) {
  const tamanho = Math.round(Math.sqrt(params.itens.length));
  const resultado = verificarVitoria(params.itens, params.marcados, tamanho);

  if (!resultado.venceu || !resultado.tipo) return;

  const tipo = resultado.tipo === "coluna" ? "linha" : resultado.tipo;

  const { data: existente } = await supabase
    .from("vitorias")
    .select("id")
    .eq("jogador_id", params.jogadorId)
    .eq("tipo", tipo)
    .maybeSingle();

  if (existente) return;

  await supabase.from("vitorias").insert({
    sala_id: params.salaId,
    jogador_id: params.jogadorId,
    tipo,
  });

  if (tipo === "cartela_cheia") {
    await supabase.from("salas").update({ status: "finalizada" }).eq("id", params.salaId);
    return;
  }

  const { data: salaAtual } = await supabase
    .from("salas")
    .select("status")
    .eq("id", params.salaId)
    .single();

  // No modo observação a sala nunca passa por "sorteando" (não tem sorteio
  // pra disparar isso) — trata "aguardando" também como "ainda sem linha".
  if (salaAtual?.status === "sorteando" || salaAtual?.status === "aguardando") {
    await supabase.from("salas").update({ status: "linha_fechada" }).eq("id", params.salaId);
  }
}
