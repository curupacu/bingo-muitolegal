interface ItemCartela {
  id: string;
  rotulo: string;
}

export function Cartela({
  itens,
  marcados,
  sorteados,
  tamanho,
  aoClicarItem,
}: {
  itens: ItemCartela[];
  marcados: string[];
  sorteados: Set<string>;
  tamanho: number;
  aoClicarItem?: (itemId: string) => void;
}) {
  const marcadosSet = new Set(marcados);

  // No celular, 5 colunas deixam a casa com ~60px — a fonte precisa encolher
  // pra palavra longa ("Cardinalidade") caber sem quebrar no meio.
  const tamanhoTexto =
    tamanho >= 5 ? "text-[10px]" : tamanho === 4 ? "text-[11px]" : "text-xs";

  return (
    <div
      className="grid gap-1.5 sm:gap-2"
      style={{ gridTemplateColumns: `repeat(${tamanho}, minmax(0, 1fr))` }}
    >
      {itens.map((item) => {
        const marcado = marcadosSet.has(item.id);
        const jaSorteado = sorteados.has(item.id);

        // Rótulo curto (ex: número do bingo tradicional) aparece grande.
        const textoCasa =
          item.rotulo.length <= 3
            ? "font-display text-xl font-extrabold sm:text-3xl"
            : `font-medium sm:text-xs ${tamanhoTexto}`;

        return (
          <button
            key={item.id}
            type="button"
            disabled={!jaSorteado}
            onClick={() => aoClicarItem?.(item.id)}
            className={
              `flex min-h-15 items-center justify-center overflow-hidden rounded-xl border-2 px-1 py-1.5 text-center leading-tight transition-[transform,box-shadow,background-color] duration-100 sm:aspect-square sm:min-h-0 sm:p-2 ${textoCasa} ` +
              (marcado
                ? "-rotate-1 border-primary bg-primary text-primary-foreground shadow-[0_3px_0_0_var(--primary-escuro)]"
                : jaSorteado
                  ? "border-bola-borda bg-bola/25 text-foreground shadow-[0_3px_0_0_var(--bola-borda)] hover:bg-bola/40 active:translate-y-[2px] active:shadow-[0_1px_0_0_var(--bola-borda)]"
                  : "border-border bg-muted/50 text-muted-foreground")
            }
          >
            <span className="w-full break-words hyphens-auto">
              {item.rotulo}
            </span>
          </button>
        );
      })}
    </div>
  );
}
