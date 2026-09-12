import Link from "next/link";

/** Assinatura visual do produto: três fichas coloridas + o nome. */
export function Marca({ comoLink = false }: { comoLink?: boolean }) {
  const conteudo = (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex items-center gap-1" aria-hidden>
        <span className="size-2.5 rounded-full bg-primary" />
        <span className="size-2.5 rounded-full bg-coral" />
        <span className="size-2.5 rounded-full bg-bola" />
      </span>
      <span className="font-display text-sm font-bold tracking-[0.14em] uppercase">
        Bingo Temático
      </span>
    </span>
  );

  if (comoLink) {
    return (
      <Link href="/" className="transition-opacity hover:opacity-70">
        {conteudo}
      </Link>
    );
  }

  return conteudo;
}
