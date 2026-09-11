import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso em componentes de cliente ("use client").
 * Usa a anon key pública — RLS no banco decide o que cada sessão pode ver/alterar.
 */
export function criarClienteSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
