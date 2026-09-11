"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSessaoAnonima } from "@/hooks/use-sessao-anonima";
import { useRoomChannel } from "@/hooks/use-room-channel";
import { criarClienteSupabase } from "@/lib/supabase/client";
import { entrarNaSala, marcarItemCartela, sortearProximoItem } from "@/app/salas/actions";
import { Cartela } from "@/components/bingo/cartela";
import { EntrarNaSalaForm } from "@/components/bingo/entrar-na-sala-form";

const STATUS_ROTULO: Record<string, string> = {
  aguardando: "Aguardando jogadores",
  sorteando: "Sorteio em andamento",
  linha_fechada: "Linha fechada",
  finalizada: "Finalizada",
};

interface ItemCartela {
  id: string;
  rotulo: string;
}

interface EstadoSala {
  id: string;
  temaNome: string;
  tamanho: number;
  status: string;
  hostSessionId: string;
}

interface Jogador {
  id: string;
  apelido: string;
}

interface ItemSorteado {
  id: string;
  rotulo: string;
  ordem: number;
}

export function SalaClient({ codigo }: { codigo: string }) {
  const sessionId = useSessaoAnonima();
  const [supabase] = useState(() => criarClienteSupabase());

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sala, setSala] = useState<EstadoSala | null>(null);
  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [itensPorId, setItensPorId] = useState<Map<string, string>>(new Map());
  const [cartelaId, setCartelaId] = useState<string | null>(null);
  const [cartela, setCartela] = useState<ItemCartela[] | null>(null);
  const [marcados, setMarcados] = useState<string[]>([]);
  const [sorteios, setSorteios] = useState<ItemSorteado[]>([]);
  const [entrando, setEntrando] = useState(false);
  const [sorteando, setSorteando] = useState(false);

  const isHost = Boolean(sessionId && sala && sessionId === sala.hostSessionId);
  const sorteadosSet = useMemo(() => new Set(sorteios.map((s) => s.id)), [sorteios]);

  const carregar = useCallback(async () => {
    if (!sessionId) return;

    const codigoUpper = codigo.toUpperCase();

    const { data: salaRow, error: erroSala } = await supabase
      .from("salas")
      .select("id, tamanho_cartela, status, host_session_id, tema_id, temas(nome)")
      .eq("codigo", codigoUpper)
      .maybeSingle();

    if (erroSala || !salaRow) {
      setErro("Sala não encontrada. Confira o código.");
      setCarregando(false);
      return;
    }

    const temaRelacionado = salaRow.temas as unknown as { nome: string } | null;

    setSala({
      id: salaRow.id,
      temaNome: temaRelacionado?.nome ?? "Tema",
      tamanho: salaRow.tamanho_cartela,
      status: salaRow.status,
      hostSessionId: salaRow.host_session_id,
    });

    const { data: itensRows } = await supabase
      .from("itens_tema")
      .select("id, rotulo")
      .eq("tema_id", salaRow.tema_id);

    const rotuloPorId = new Map((itensRows ?? []).map((i) => [i.id, i.rotulo]));
    setItensPorId(rotuloPorId);

    const { data: sorteiosRows } = await supabase
      .from("sorteios")
      .select("item_tema_id, ordem")
      .eq("sala_id", salaRow.id)
      .order("ordem");

    setSorteios(
      (sorteiosRows ?? []).map((s) => ({
        id: s.item_tema_id,
        ordem: s.ordem,
        rotulo: rotuloPorId.get(s.item_tema_id) ?? "?",
      }))
    );

    const { data: jogadoresRows } = await supabase
      .from("jogadores")
      .select("id, apelido")
      .eq("sala_id", salaRow.id)
      .order("entrou_em");

    setJogadores(jogadoresRows ?? []);

    const { data: jogadorAtual } = await supabase
      .from("jogadores")
      .select("id")
      .eq("sala_id", salaRow.id)
      .eq("session_id", sessionId)
      .maybeSingle();

    if (jogadorAtual) {
      const { data: cartelaRow } = await supabase
        .from("cartelas")
        .select("id, itens, marcados")
        .eq("jogador_id", jogadorAtual.id)
        .single();

      if (cartelaRow) {
        setCartelaId(cartelaRow.id);
        setCartela(
          (cartelaRow.itens as string[]).map((id) => ({
            id,
            rotulo: rotuloPorId.get(id) ?? "?",
          }))
        );
        setMarcados(cartelaRow.marcados as string[]);
      }
    }

    setCarregando(false);
  }, [codigo, sessionId, supabase]);

  useEffect(() => {
    // Busca de dados ao montar — sem camada de data-fetching no App Router
    // pra esse caso (depende da sessão anônima, só disponível no client).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar();
  }, [carregar]);

  useRoomChannel(supabase, sala?.id ?? null, {
    aoEntrarJogador: (novoJogador) => {
      setJogadores((atual) =>
        atual.some((j) => j.id === novoJogador.id) ? atual : [...atual, novoJogador]
      );
    },
    aoAtualizarStatus: (status) => {
      setSala((atual) => (atual ? { ...atual, status } : atual));
    },
    aoSortear: ({ itemTemaId, ordem }) => {
      setSorteios((atual) => {
        if (atual.some((s) => s.id === itemTemaId)) return atual;
        const rotulo = itensPorId.get(itemTemaId) ?? "?";
        return [...atual, { id: itemTemaId, ordem, rotulo }].sort((a, b) => a.ordem - b.ordem);
      });
    },
  });

  async function aoEntrar(apelido: string) {
    if (!sessionId) return;
    setEntrando(true);
    const resultado = await entrarNaSala({ codigo, apelido, sessionId });
    setEntrando(false);

    if (!resultado.ok) {
      toast.error(resultado.erro ?? "Não deu pra entrar na sala.");
      return;
    }

    setCarregando(true);
    await carregar();
  }

  async function aoSortear() {
    if (!sessionId) return;
    setSorteando(true);
    const resultado = await sortearProximoItem({ codigo, sessionId });
    setSorteando(false);

    if (!resultado.ok) {
      toast.error(resultado.erro ?? "Não deu pra sortear.");
    }
    // Em caso de sucesso não precisa atualizar nada aqui — o próprio host
    // também está assinado no canal e recebe o evento de volta, igual todo
    // mundo.
  }

  async function aoClicarItem(itemId: string) {
    if (!cartelaId) return;
    const marcarAgora = !marcados.includes(itemId);

    setMarcados((atual) =>
      marcarAgora ? [...atual, itemId] : atual.filter((id) => id !== itemId)
    );

    const resultado = await marcarItemCartela({ cartelaId, itemId, marcar: marcarAgora });

    if (!resultado.ok) {
      toast.error(resultado.erro ?? "Não deu pra marcar.");
      setMarcados((atual) =>
        marcarAgora ? atual.filter((id) => id !== itemId) : [...atual, itemId]
      );
    }
  }

  if (carregando) {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <p className="text-sm text-muted-foreground">Carregando sala...</p>
      </main>
    );
  }

  if (erro || !sala) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
        <p className="text-sm text-muted-foreground">{erro}</p>
        <Button render={<Link href="/" />} nativeButton={false} variant="secondary">
          Voltar pro início
        </Button>
      </main>
    );
  }

  const totalItens = itensPorId.size;
  const todosSorteados = totalItens > 0 && sorteios.length >= totalItens;
  const ultimoSorteio = sorteios[sorteios.length - 1];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Sala &middot; {sala.temaNome}
          </p>
          <h1 className="text-2xl font-bold tracking-tight uppercase">{codigo}</h1>
        </div>
        <Badge variant="secondary">
          {STATUS_ROTULO[sala.status] ?? sala.status}
        </Badge>
      </header>

      <Separator />

      {!cartela ? (
        <Card className="mx-auto w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-base">Entrar nessa sala</CardTitle>
          </CardHeader>
          <CardContent>
            <EntrarNaSalaForm aoEntrar={aoEntrar} enviando={entrando} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sua cartela</CardTitle>
            </CardHeader>
            <CardContent>
              <Cartela
                itens={cartela}
                marcados={marcados}
                sorteados={sorteadosSet}
                tamanho={sala.tamanho}
                aoClicarItem={aoClicarItem}
              />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sorteio</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {isHost && (
                  <Button
                    size="sm"
                    onClick={aoSortear}
                    disabled={sorteando || todosSorteados}
                  >
                    {sorteando
                      ? "Sorteando..."
                      : todosSorteados
                        ? "Todos os itens já saíram"
                        : `Sortear próximo (${sorteios.length}/${totalItens})`}
                  </Button>
                )}

                {sorteios.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {isHost
                      ? "Clique em sortear pra começar."
                      : "Nenhum item sorteado ainda."}
                  </p>
                ) : (
                  <>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Último: </span>
                      <strong>{ultimoSorteio.rotulo}</strong>
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {sorteios.map((s) => (
                        <Badge key={s.id} variant="outline" className="font-normal">
                          {s.rotulo}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  Jogadores ({jogadores.length})
                  <span
                    className="size-1.5 rounded-full bg-emerald-500"
                    title="Atualiza ao vivo"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {jogadores.map((jogador) => (
                    <li key={jogador.id}>{jogador.apelido}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Protótipo — detectar bingo de linha/cartela cheia entra no Sprint 4
        (veja <code className="rounded bg-muted px-1 py-0.5">docs/SPRINTS.md</code>
        ). Clique numa casa da cartela depois que o item for sorteado pra
        marcar.
      </p>
    </main>
  );
}
