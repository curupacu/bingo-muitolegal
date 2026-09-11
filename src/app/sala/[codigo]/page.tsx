import { SalaClient } from "@/components/bingo/sala-client";

export default async function SalaPage({
  params,
}: PageProps<"/sala/[codigo]">) {
  const { codigo } = await params;

  return <SalaClient codigo={codigo} />;
}
