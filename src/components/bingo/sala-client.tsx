"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSessaoAnonima } from "@/hooks/use-sessao-anonima";
import { criarClienteSupabase } from "@/lib/supabase/client";
import { entrarNaSala } from "@/app/salas/actions";
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
}

export function SalaClient({ codigo }: { codigo: string }) {
  const sessionId = useSessaoAnonima();
  const [supabase] = useState(() => criarClienteSupabase());

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [sala, setSala] = useState<EstadoSala | null>(null);
  const [jogadores, setJogadores] = useState<string[]>([]);
  const [cartela, setCartela] = useState<ItemCartela[] | null>(null);
  const [marcados, setMarcados] = useState<string[]>([]);
  const [entrando, setEntrando] = useState(false);

  const carregar = useCallback(async () => {
    if (!sessionId) return;

    const codigoUpper = codigo.toUpperCase();

    const { data: salaRow, error: erroSala } = await supabase
      .from("salas")
      .select("id, tamanho_cartela, status, temas(nome)")
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
    });

    const { data: jogadoresRows } = await supabase
      .from("jogadores")
      .select("apelido")
      .eq("sala_id", salaRow.id)
      .order("entrou_em");

    setJogadores((jogadoresRows ?? []).map((j) => j.apelido));

    const { data: jogadorAtual } = await supabase
      .from("jogadores")
      .select("id")
      .eq("sala_id", salaRow.id)
      .eq("session_id", sessionId)
      .maybeSingle();

    if (jogadorAtual) {
      const { data: cartelaRow } = await supabase
        .from("cartelas")
        .select("itens, marcados")
        .eq("jogador_id", jogadorAtual.id)
        .single();

      if (cartelaRow) {
        const { data: itensRows } = await supabase
          .from("itens_tema")
          .select("id, rotulo")
          .in("id", cartelaRow.itens);

        const rotuloPorId = new Map((itensRows ?? []).map((i) => [i.id, i.rotulo]));
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
              <Cartela itens={cartela} marcados={marcados} tamanho={sala.tamanho} />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sorteio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nenhum item sorteado ainda.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Jogadores ({jogadores.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {jogadores.map((apelido, i) => (
                    <li key={i}>{apelido}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Protótipo — sorteio e sincronização em tempo real entram nos Sprints
        2 a 4 (veja{" "}
        <code className="rounded bg-muted px-1 py-0.5">docs/SPRINTS.md</code>).
        Atualize a página pra ver jogadores novos por enquanto.
      </p>
    </main>
  );
}
