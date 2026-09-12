import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CriarSalaForm } from "@/components/bingo/criar-sala-form";
import { Marca } from "@/components/bingo/marca";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";

export default async function CriarSalaPage() {
  const supabase = await criarClienteSupabaseServidor();
  const { data: temas } = await supabase
    .from("temas")
    .select("slug, nome")
    .order("nome");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-14">
      <Marca comoLink />

      <Card className="w-full max-w-md overflow-hidden border-2 p-0">
        <div className="h-1.5 bg-primary" />
        <CardHeader className="px-6 pt-6">
          <CardTitle className="font-display text-2xl">Criar uma sala</CardTitle>
          <CardDescription>
            Escolha o tema, o tamanho da cartela e seu apelido como host.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <CriarSalaForm
            temas={(temas ?? []).map((t) => ({ valor: t.slug, rotulo: t.nome }))}
          />
        </CardContent>
      </Card>

      <Button
        render={<Link href="/" />}
        nativeButton={false}
        variant="ghost"
        size="sm"
      >
        Voltar
      </Button>
    </main>
  );
}
