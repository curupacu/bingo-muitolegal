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

  return (
    <div
      className="grid gap-1.5 sm:gap-2"
      style={{ gridTemplateColumns: `repeat(${tamanho}, minmax(0, 1fr))` }}
    >
      {itens.map((item) => {
        const marcado = marcadosSet.has(item.id);
        const jaSorteado = sorteados.has(item.id);

        return (
          <button
            key={item.id}
            type="button"
            disabled={!jaSorteado}
            onClick={() => aoClicarItem?.(item.id)}
            className={
              "flex min-h-14 items-center justify-center rounded-md border p-1 text-center text-[11px] leading-tight break-words hyphens-auto transition-colors sm:aspect-square sm:min-h-0 sm:p-2 sm:text-xs " +
              (marcado
                ? "border-primary bg-primary text-primary-foreground"
                : jaSorteado
                  ? "border-emerald-500/50 bg-emerald-500/10 text-foreground hover:bg-emerald-500/20"
                  : "bg-muted/40 text-muted-foreground")
            }
          >
            {item.rotulo}
          </button>
        );
      })}
    </div>
  );
}
