"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EntrarSalaForm() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");

  function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    const codigoLimpo = codigo.trim().toUpperCase();
    if (!codigoLimpo) return;
    router.push(`/sala/${codigoLimpo}`);
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={aoEnviar}>
      <div className="grid gap-1.5">
        <Label htmlFor="codigo">Código da sala</Label>
        <Input
          id="codigo"
          name="codigo"
          placeholder="Ex: BD7X2K"
          autoComplete="off"
          className="uppercase"
          value={codigo}
          onChange={(evento) => setCodigo(evento.target.value)}
        />
      </div>
      <Button type="submit" variant="secondary" className="w-full">
        Entrar
      </Button>
    </form>
  );
}
