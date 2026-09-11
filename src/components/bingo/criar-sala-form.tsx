"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSessaoAnonima } from "@/hooks/use-sessao-anonima";
import { criarSala } from "@/app/salas/actions";

const TAMANHOS = [
  { valor: "3", rotulo: "3x3 (9 casas)" },
  { valor: "4", rotulo: "4x4 (16 casas)" },
  { valor: "5", rotulo: "5x5 (25 casas)" },
];

const MODOS = [
  {
    valor: "sorteio",
    rotulo: "Sorteio",
    descricao: "O sistema sorteia os itens um a um, você controla o ritmo",
  },
  {
    valor: "observacao",
    rotulo: "Observação ao vivo",
    descricao: "Sem sorteio — cada jogador marca na hora o que for acontecendo",
  },
];

interface OpcaoTema {
  valor: string;
  rotulo: string;
}

export function CriarSalaForm({ temas }: { temas: OpcaoTema[] }) {
  const router = useRouter();
  const sessionId = useSessaoAnonima();
  const [enviando, setEnviando] = useState(false);
  const [mostrarJanela, setMostrarJanela] = useState(false);

  async function aoEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!sessionId) {
      toast.error("Ainda carregando sua sessão — tenta de novo em 1 segundo.");
      return;
    }

    const dados = new FormData(evento.currentTarget);
    const apelido = String(dados.get("apelido") ?? "");
    const temaSlug = String(dados.get("tema") ?? "");
    const tamanho = Number(dados.get("tamanho") ?? 5);
    const modo = String(dados.get("modo") ?? "sorteio") as "sorteio" | "observacao";
    const abreEmLocal = String(dados.get("abre_em") ?? "");
    const fechaEmLocal = String(dados.get("fecha_em") ?? "");

    setEnviando(true);
    const resultado = await criarSala({
      apelido,
      temaSlug,
      tamanho,
      sessionId,
      modo,
      abreEm: abreEmLocal ? new Date(abreEmLocal).toISOString() : null,
      fechaEm: fechaEmLocal ? new Date(fechaEmLocal).toISOString() : null,
    });
    setEnviando(false);

    if (!resultado.ok || !resultado.codigo) {
      toast.error(resultado.erro ?? "Não deu pra criar a sala.");
      return;
    }

    router.push(`/sala/${resultado.codigo}`);
  }

  if (temas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum tema cadastrado ainda. Cadastre um tema em{" "}
        <code className="rounded bg-muted px-1 py-0.5">supabase/seed.sql</code>{" "}
        antes de criar uma sala.
      </p>
    );
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={aoEnviar}>
      <div className="grid gap-1.5">
        <Label htmlFor="apelido">Seu apelido</Label>
        <Input id="apelido" name="apelido" placeholder="Ex: Prof. Ana" required />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="tema">Tema</Label>
        <Select
          name="tema"
          items={temas.map((t) => ({ value: t.valor, label: t.rotulo }))}
          defaultValue={temas[0].valor}
        >
          <SelectTrigger id="tema" className="w-full">
            <SelectValue placeholder="Escolha um tema" />
          </SelectTrigger>
          <SelectContent>
            {temas.map((tema) => (
              <SelectItem key={tema.valor} value={tema.valor}>
                {tema.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="tamanho">Tamanho da cartela</Label>
        <Select
          name="tamanho"
          items={TAMANHOS.map((t) => ({ value: t.valor, label: t.rotulo }))}
          defaultValue={TAMANHOS[2].valor}
        >
          <SelectTrigger id="tamanho" className="w-full">
            <SelectValue placeholder="Escolha o tamanho" />
          </SelectTrigger>
          <SelectContent>
            {TAMANHOS.map((tamanho) => (
              <SelectItem key={tamanho.valor} value={tamanho.valor}>
                {tamanho.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="modo">Como funciona o sorteio</Label>
        <Select
          name="modo"
          items={MODOS.map((m) => ({ value: m.valor, label: m.rotulo }))}
          defaultValue={MODOS[0].valor}
        >
          <SelectTrigger id="modo" className="w-full">
            <SelectValue placeholder="Escolha o modo" />
          </SelectTrigger>
          <SelectContent>
            {MODOS.map((modo) => (
              <SelectItem key={modo.valor} value={modo.valor}>
                {modo.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {MODOS.find((m) => m.valor === "sorteio")?.descricao} · ou{" "}
          {MODOS.find((m) => m.valor === "observacao")?.descricao.toLowerCase()}
        </p>
      </div>

      {mostrarJanela ? (
        <div className="grid gap-3 rounded-md border p-3">
          <div className="grid gap-1.5">
            <Label htmlFor="abre_em">Abre em</Label>
            <Input id="abre_em" name="abre_em" type="datetime-local" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="fecha_em">Fecha em</Label>
            <Input id="fecha_em" name="fecha_em" type="datetime-local" />
          </div>
          <p className="text-xs text-muted-foreground">
            Útil pra evento de mais de um dia — deixa em branco pra sala sem
            data marcada.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setMostrarJanela(true)}
          className="text-left text-xs text-muted-foreground underline underline-offset-2"
        >
          + Marcar data de início/fim (opcional, pra eventos de vários dias)
        </button>
      )}

      <Button type="submit" className="w-full" disabled={enviando}>
        {enviando ? "Criando..." : "Criar sala"}
      </Button>
    </form>
  );
}
