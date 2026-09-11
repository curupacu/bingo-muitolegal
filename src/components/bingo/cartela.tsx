interface ItemCartela {
  id: string;
  rotulo: string;
}

export function Cartela({
  itens,
  marcados,
  tamanho,
}: {
  itens: ItemCartela[];
  marcados: string[];
  tamanho: number;
}) {
  const marcadosSet = new Set(marcados);

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${tamanho}, minmax(0, 1fr))` }}
    >
      {itens.map((item) => {
        const marcado = marcadosSet.has(item.id);
        return (
          <div
            key={item.id}
            className={
              "flex aspect-square items-center justify-center rounded-md border p-2 text-center text-xs " +
              (marcado
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground")
            }
          >
            {item.rotulo}
          </div>
        );
      })}
    </div>
  );
}
