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
      className="grid gap-2"
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
              "flex aspect-square items-center justify-center rounded-md border p-2 text-center text-xs transition-colors " +
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
