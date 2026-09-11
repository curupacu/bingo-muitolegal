import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CartelaMock } from "@/components/bingo/cartela-mock";

export default async function SalaPage({
  params,
}: PageProps<"/sala/[codigo]">) {
  const { codigo } = await params;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Sala</p>
          <h1 className="text-2xl font-bold tracking-tight uppercase">
            {codigo}
          </h1>
        </div>
        <Badge variant="secondary">Aguardando jogadores</Badge>
      </header>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sua cartela</CardTitle>
          </CardHeader>
          <CardContent>
            <CartelaMock tamanho={5} />
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
              <CardTitle className="text-base">Jogadores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ninguém entrou na sala ainda.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Protótipo visual — sorteio e sincronização em tempo real entram nos
        Sprints 2 a 4 (veja{" "}
        <code className="rounded bg-muted px-1 py-0.5">docs/SPRINTS.md</code>).
      </p>
    </main>
  );
}
