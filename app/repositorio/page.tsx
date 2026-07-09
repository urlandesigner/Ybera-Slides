import { redirect } from "next/navigation";
import { AppShell, PageHeader } from "@/components/AppShell";
import { DeckListItem } from "@/components/DeckListItem";
import { EmptyState } from "@/components/EmptyState";
import { createClient } from "@/lib/supabase/server";

// Repositório: apresentações públicas de toda a equipe.
export default async function RepositorioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?erro=sessao");

  const { data: decks, error } = await supabase
    .from("decks")
    .select("id, titulo, marca, autor_email, created_at")
    .eq("visibilidade", "publica")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AppShell email={user.email ?? ""} active="repositorio">
      <PageHeader
        kicker="EQUIPE"
        titulo="Repositório"
        descricao="Apresentações públicas de toda a equipe — clique para rever, visualizar ou editar."
      />

      {error ? (
        <p className="text-sm text-erro">Não foi possível carregar o repositório. Recarregue a página.</p>
      ) : !decks || decks.length === 0 ? (
        <EmptyState
          titulo="Nenhuma apresentação pública ainda"
          texto="Quando alguém da equipe gerar uma apresentação pública, ela aparece aqui para todos."
          cta="Criar a primeira"
          href="/"
        />
      ) : (
        <div className="flex flex-col">
          {decks.map((d) => (
            <DeckListItem
              key={d.id}
              id={d.id}
              titulo={d.titulo}
              marca={d.marca}
              autorEmail={d.autor_email}
              createdAt={d.created_at}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
