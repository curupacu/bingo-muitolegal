"use client";

import { useState } from "react";
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

/**
 * Temas de exemplo apenas para visualização do fluxo.
 * A partir do Sprint 1, essa lista vem da tabela `temas` no Supabase.
 */
const TEMAS_EXEMPLO = [
  { valor: "banco-de-dados", rotulo: "Banco de Dados" },
  { valor: "normalizacao", rotulo: "Banca de Normalização" },
  { valor: "redes", rotulo: "Redes de Computadores" },
];

const TAMANHOS = [
  { valor: "3", rotulo: "3x3 (9 casas)" },
  { valor: "4", rotulo: "4x4 (16 casas)" },
  { valor: "5", rotulo: "5x5 (25 casas)" },
];

export function CriarSalaForm() {
  const [enviando, setEnviando] = useState(false);

  function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    // TODO (Sprint 1): criar a sala no Supabase e redirecionar para /sala/[codigo]
    setTimeout(() => {
      setEnviando(false);
      toast.info("Criação de sala ainda não está ligada ao backend.", {
        description: "Isso entra no Sprint 1 — veja docs/SPRINTS.md.",
      });
    }, 400);
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
          items={TEMAS_EXEMPLO.map((t) => ({ value: t.valor, label: t.rotulo }))}
          defaultValue={TEMAS_EXEMPLO[0].valor}
        >
          <SelectTrigger id="tema" className="w-full">
            <SelectValue placeholder="Escolha um tema" />
          </SelectTrigger>
          <SelectContent>
            {TEMAS_EXEMPLO.map((tema) => (
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

      <Button type="submit" className="w-full" disabled={enviando}>
        {enviando ? "Criando..." : "Criar sala"}
      </Button>
    </form>
  );
}
