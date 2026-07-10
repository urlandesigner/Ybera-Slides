import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { DeckPreview } from "@/components/DeckPreview";
import { createClient } from "@/lib/supabase/server";

export default async function DeckPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { data: deck } = await supabase
    .from("decks")
    .select("id, titulo, marca, autor_email, created_at, html, user_id, visibilidade")
    .eq("id", id)
    .single();

  // Restritas de outra pessoa nem chegam aqui — o RLS não retorna a linha
  if (!deck) notFound();

  const ehDono = deck.user_id === user.id;
  const data = new Date(deck.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <AppShell email={user.email ?? ""}>
      <Link
        href={ehDono ? "/?filtro=minhas" : "/"}
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta3"
      >
        ← APRESENTAÇÕES
      </Link>
      <DeckPreview
        html={deck.html}
        titulo={deck.titulo}
        navegavel
        actions={
          <Button key="editar" href={`/deck/${deck.id}/editar`}>
            EDITAR
          </Button>
        }
      />
      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        {ehDono ? (
          <p className="font-mono text-xs tracking-[0.1em] text-tinta4">
            {deck.visibilidade === "restrita" ? "RESTRITA · SÓ VOCÊ VÊ" : "PÚBLICA · VISÍVEL PRA TODA A EQUIPE"}
          </p>
        ) : (
          <span />
        )}
        <p className="text-sm text-tinta4">
          Gerada por {deck.autor_email} em {data}
        </p>
      </div>
    </AppShell>
  );
}
