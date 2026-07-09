import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { DeckPreview } from "@/components/DeckPreview";
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
    .select("id, titulo, marca, autor_email, created_at, html")
    .eq("id", id)
    .single();

  if (!deck) notFound();

  const data = new Date(deck.created_at).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AppShell email={user.email ?? ""} active="historico">
      <div className="mb-8 flex flex-col gap-2">
        <Link
          href="/historico"
          className="font-mono text-xs tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta3"
        >
          ← HISTÓRICO
        </Link>
        <p className="text-sm text-tinta4">
          Gerada por {deck.autor_email} em {data}
        </p>
      </div>
      <DeckPreview
        html={deck.html}
        titulo={deck.titulo}
        actions={
          <Link
            href={`/deck/${deck.id}/editar`}
            className="rounded-full border border-fio18 px-5 py-2 font-mono text-xs tracking-[0.12em] text-tinta3 hover:border-fio25 hover:text-tinta2"
          >
            EDITAR
          </Link>
        }
      />
    </AppShell>
  );
}
