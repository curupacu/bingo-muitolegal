"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EntrarNaSalaForm({
  aoEntrar,
  enviando,
}: {
  aoEntrar: (apelido: string) => void;
  enviando: boolean;
}) {
  const [apelido, setApelido] = useState("");

  function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!apelido.trim()) return;
    aoEntrar(apelido.trim());
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={aoEnviar}>
      <div className="grid gap-1.5">
        <Label htmlFor="apelido-sala">Seu apelido</Label>
        <Input
          id="apelido-sala"
          placeholder="Ex: João"
          value={apelido}
          onChange={(evento) => setApelido(evento.target.value)}
          autoFocus
          required
        />
      </div>
      <Button type="submit" disabled={enviando}>
        {enviando ? "Entrando..." : "Entrar na sala"}
      </Button>
    </form>
  );
}
