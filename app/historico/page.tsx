import { redirect } from "next/navigation";
import { AppShell, PageHeader } from "@/components/AppShell";
import { DeckListItem } from "@/components/DeckListItem";
import { EmptyState } from "@/components/EmptyState";
import { createClient } from "@/lib/supabase/server";

export default async function HistoricoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?erro=sessao");

  const { data: decks, error } = await supabase
    .from("decks")
    .select("id, titulo, marca, autor_email, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AppShell email={user.email ?? ""} active="historico">
      <PageHeader
        kicker="EQUIPE"
        titulo="Histórico"
        descricao="Apresentações geradas por toda a equipe — clique para rever, visualizar ou editar."
      />

      {error ? (
        <p className="text-sm text-erro">Não foi possível carregar o histórico. Recarregue a página.</p>
      ) : !decks || decks.length === 0 ? (
        <EmptyState
          titulo="Nenhuma apresentação ainda"
          texto="Quando alguém da equipe gerar uma apresentação, ela aparece aqui para todos."
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
