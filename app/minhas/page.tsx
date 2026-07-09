import { redirect } from "next/navigation";
import { AppShell, PageHeader } from "@/components/AppShell";
import { DeckListItem } from "@/components/DeckListItem";
import { EmptyState } from "@/components/EmptyState";
import { createClient } from "@/lib/supabase/server";

// Minhas apresentações: tudo que é meu, públicas e restritas (com selo).
export default async function MinhasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?erro=sessao");

  const { data: decks, error } = await supabase
    .from("decks")
    .select("id, titulo, marca, autor_email, created_at, visibilidade")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AppShell email={user.email ?? ""} active="minhas">
      <PageHeader
        kicker="SUAS APRESENTAÇÕES"
        titulo="Minhas"
        descricao="Tudo o que você gerou ou editou — inclusive as restritas, que só você vê."
      />

      {error ? (
        <p className="text-sm text-erro">Não foi possível carregar suas apresentações. Recarregue a página.</p>
      ) : !decks || decks.length === 0 ? (
        <EmptyState
          titulo="Você ainda não gerou nenhuma apresentação"
          texto="Preencha um briefing e sua primeira apresentação aparece aqui."
          cta="Criar agora"
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
              visibilidade={d.visibilidade}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
