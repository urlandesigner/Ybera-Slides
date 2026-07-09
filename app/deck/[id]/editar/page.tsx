import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { deckSchema } from "@/lib/schema";
import { createClient } from "@/lib/supabase/server";
import { EditorClient } from "./editor-client";

export default async function EditarDeckPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?erro=sessao");

  const { id } = await params;
  const { data: row } = await supabase
    .from("decks")
    .select("id, titulo, marca, modo, slides")
    .eq("id", id)
    .single();
  if (!row) notFound();

  const parsed = deckSchema.safeParse({
    titulo: row.titulo,
    marca: row.marca,
    modo: row.modo,
    slides: row.slides,
  });
  if (!parsed.success) notFound();

  return (
    <AppShell email={user.email ?? ""} active="historico">
      <div className="mb-8 flex flex-col gap-2">
        <Link
          href={`/deck/${row.id}`}
          className="font-mono text-xs tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta3"
        >
          ← VOLTAR SEM SALVAR
        </Link>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Editar apresentação</h1>
        <p className="text-tinta3">
          Ajuste os textos de cada slide — a estrutura e o padrão visual são fixos. O preview
          atualiza em tempo real.
        </p>
      </div>
      <EditorClient deckInicial={parsed.data} sourceId={row.id} />
    </AppShell>
  );
}
