/**
 * Visualização estática da grade da cartela, só para o protótipo visual.
 * A partir do Sprint 3, cada casa vem de `gerarCartela()` e fica marcável
 * conforme os sorteios chegam pelo canal realtime.
 */
export function CartelaMock({ tamanho }: { tamanho: number }) {
  const casas = Array.from({ length: tamanho * tamanho }, (_, i) => i + 1);

  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${tamanho}, minmax(0, 1fr))` }}
    >
      {casas.map((numero) => (
        <div
          key={numero}
          className="flex aspect-square items-center justify-center rounded-md border bg-muted/40 p-2 text-center text-xs text-muted-foreground"
        >
          Item {numero}
        </div>
      ))}
    </div>
  );
}
