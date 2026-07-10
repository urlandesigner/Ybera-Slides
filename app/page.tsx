import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ApresentacoesClient } from "./apresentacoes-client";
import { buscarDecks, type Filtro } from "@/lib/decks-lista";
import { createClient } from "@/lib/supabase/server";

// SSR só na primeira visita (rápido, sem flash de carregamento e com deep-link
// funcionando via ?filtro=). Trocar de aba depois disso é responsabilidade do
// componente cliente, que busca sob demanda e guarda em memória.
export default async function ApresentacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { filtro: filtroRaw } = await searchParams;
  const filtroInicial: Filtro = filtroRaw === "minhas" ? "minhas" : "publicas";

  const { decks, erro } = await buscarDecks(supabase, filtroInicial, user.id);

  return (
    <AppShell email={user.email ?? ""}>
      <ApresentacoesClient
        filtroInicial={filtroInicial}
        decksIniciais={erro ? null : decks}
        erroInicial={erro}
      />
    </AppShell>
  );
}
