import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EntrarSalaForm } from "@/components/bingo/entrar-sala-form";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Bingo Temático
        </span>
        <h1 className="max-w-xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          Bingo em tempo real, com os temas que você escolher
        </h1>
        <p className="max-w-md text-muted-foreground">
          Crie uma sala, escolha o tema, e jogue com a turma. Cartelas
          sorteadas na hora — vence quem fechar a linha primeiro, e depois a
          cartela cheia.
        </p>
      </div>

      <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Criar uma sala</CardTitle>
            <CardDescription>
              Você escolhe o tema e o tamanho da cartela. A galera entra com o
              código.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              render={<Link href="/criar" />}
              nativeButton={false}
              className="w-full"
            >
              Criar sala
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entrar em uma sala</CardTitle>
            <CardDescription>
              Tem um código de sala? Entre com um apelido, sem precisar criar
              conta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EntrarSalaForm />
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Protótipo em construção — veja o plano em{" "}
        <code className="rounded bg-muted px-1 py-0.5">docs/SPRINTS.md</code>
      </p>
    </main>
  );
}
