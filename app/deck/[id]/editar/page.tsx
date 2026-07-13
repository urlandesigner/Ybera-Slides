import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { deckSchema, type Visibilidade } from "@/lib/schema";
import { createClient } from "@/lib/supabase/server";
import { EditorClient } from "./editor-client";

export default async function EditarDeckPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { data: row } = await supabase
    .from("decks")
    .select("id, titulo, marca, modo, slides, visibilidade, user_id")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
  if (!row) notFound();
  // Editar é ação de dono — visualizar/baixar continuam livres pra apresentações públicas.
  if (row.user_id !== user.id) notFound();

  const parsed = deckSchema.safeParse({
    titulo: row.titulo,
    marca: row.marca,
    modo: row.modo,
    slides: row.slides,
  });
  if (!parsed.success) notFound();

  return (
    <AppShell email={user.email ?? ""}>
      <div className="mb-8 flex flex-col gap-2">
        <Link
          href={`/deck/${row.id}`}
          className="font-mono text-xs tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta3"
        >
          ← VOLTAR SEM SALVAR
        </Link>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Editar apresentação</h1>
        <p className="text-tinta3">Ajuste os textos — o preview atualiza na hora.</p>
      </div>
      <EditorClient
        deckInicial={parsed.data}
        sourceId={row.id}
        visibilidadeInicial={row.visibilidade as Visibilidade}
      />
    </AppShell>
  );
}
