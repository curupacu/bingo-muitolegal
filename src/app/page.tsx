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
import { Marca } from "@/components/bingo/marca";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-14">
      <div className="flex flex-col items-center gap-5 text-center">
        <Marca />

        <h1 className="max-w-xl font-display text-4xl leading-[1.05] font-extrabold text-balance sm:text-5xl">
          Bingo em tempo real, com os temas que{" "}
          <span className="relative inline-block">
            <span className="absolute inset-x-[-6px] inset-y-[2px] -rotate-1 rounded-lg bg-bola/70" />
            <span className="relative">você escolher</span>
          </span>
        </h1>

        <p className="max-w-md text-[0.95rem] text-muted-foreground">
          Crie uma sala, escolha o tema, e jogue com a turma. Cartelas
          sorteadas na hora — vence quem fechar a linha primeiro, e depois a
          cartela cheia.
        </p>
      </div>

      <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-2">
        <Card className="overflow-hidden border-2 p-0">
          <div className="h-1.5 bg-primary" />
          <div className="p-6">
            <CardHeader className="p-0">
              <CardTitle className="font-display text-xl">
                Criar uma sala
              </CardTitle>
              <CardDescription>
                Você escolhe o tema e o tamanho da cartela. A galera entra com
                o código.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-5 p-0">
              <Button
                render={<Link href="/criar" />}
                nativeButton={false}
                className="w-full"
              >
                Criar sala
              </Button>
            </CardContent>
          </div>
        </Card>

        <Card className="overflow-hidden border-2 p-0">
          <div className="h-1.5 bg-coral" />
          <div className="p-6">
            <CardHeader className="p-0">
              <CardTitle className="font-display text-xl">
                Entrar em uma sala
              </CardTitle>
              <CardDescription>
                Tem um código de sala? Entre com um apelido, sem precisar criar
                conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-5 p-0">
              <EntrarSalaForm />
            </CardContent>
          </div>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Sem cadastro, sem app pra baixar — só abrir o link e jogar.
      </p>
    </main>
  );
}
