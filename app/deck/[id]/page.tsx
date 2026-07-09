import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DeckPreview } from "@/components/DeckPreview";
import { VisibilityToggle } from "@/components/VisibilityToggle";
import type { Visibilidade } from "@/lib/schema";
import { createClient } from "@/lib/supabase/server";

export default async function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?erro=sessao");

  const { id } = await params;
  const { data: deck } = await supabase
    .from("decks")
    .select("id, titulo, marca, autor_email, created_at, html, user_id, visibilidade")
    .eq("id", id)
    .single();

  // Restritas de outra pessoa nem chegam aqui — o RLS não retorna a linha
  if (!deck) notFound();

  const ehDono = deck.user_id === user.id;
  const data = new Date(deck.created_at).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AppShell email={user.email ?? ""} active={ehDono ? "minhas" : "repositorio"}>
      <div className="mb-8 flex flex-col gap-3">
        <Link
          href={ehDono ? "/minhas" : "/repositorio"}
          className="font-mono text-xs tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta3"
        >
          ← {ehDono ? "MINHAS" : "REPOSITÓRIO"}
        </Link>
        <p className="text-sm text-tinta4">
          Gerada por {deck.autor_email} em {data}
        </p>
        {ehDono ? (
          <VisibilityToggle deckId={deck.id} inicial={deck.visibilidade as Visibilidade} />
        ) : null}
      </div>
      <DeckPreview
        html={deck.html}
        titulo={deck.titulo}
        actions={
          <Link
            key="editar"
            href={`/deck/${deck.id}/editar`}
            className="rounded-full border border-fio18 px-5 py-2 font-mono text-xs tracking-[0.12em] text-tinta3 transition-colors hover:border-fio25 hover:text-tinta2"
          >
            EDITAR
          </Link>
        }
      />
    </AppShell>
  );
}
