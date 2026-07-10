import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell, PageHeader } from "@/components/AppShell";
import { DeckListItem } from "@/components/DeckListItem";
import { EmptyState } from "@/components/EmptyState";
import { renderDeck } from "@/lib/renderer";
import type { Slide } from "@/lib/schema";
import { createClient } from "@/lib/supabase/server";

type Filtro = "minhas" | "publicas";

function FiltroToggle({ filtro }: { filtro: Filtro }) {
  const opcoes: { valor: Filtro; rotulo: string }[] = [
    { valor: "publicas", rotulo: "PÚBLICAS" },
    { valor: "minhas", rotulo: "MINHAS" },
  ];

  return (
    <div className="mb-8 flex w-fit items-center rounded-full border border-fio18">
      {opcoes.map((opcao) => (
        <Link
          key={opcao.valor}
          href={opcao.valor === "publicas" ? "/" : `/?filtro=${opcao.valor}`}
          aria-current={filtro === opcao.valor ? "true" : undefined}
          className={
            filtro === opcao.valor
              ? "rounded-full bg-tinta px-4 py-1.5 font-mono text-[11px] tracking-[0.12em] text-fundo"
              : "rounded-full px-4 py-1.5 font-mono text-[11px] tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta2"
          }
        >
          {opcao.rotulo}
        </Link>
      ))}
    </div>
  );
}

// Apresentações: públicas da equipe ou só as minhas, alternável por ?filtro=.
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
  const filtro: Filtro = filtroRaw === "minhas" ? "minhas" : "publicas";

  const query = supabase
    .from("decks")
    .select("id, titulo, marca, modo, slides, autor_email, created_at, visibilidade")
    .order("created_at", { ascending: false })
    .limit(200);

  const { data: decks, error } =
    filtro === "minhas" ? await query.eq("user_id", user.id) : await query.eq("visibilidade", "publica");

  return (
    <AppShell email={user.email ?? ""}>
      <PageHeader
        titulo="Apresentações"
        descricao={
          filtro === "minhas"
            ? "Tudo o que você gerou ou editou, inclusive as restritas."
            : "Apresentações públicas do Grupo Ybera."
        }
      />

      <FiltroToggle filtro={filtro} />

      {error ? (
        <p className="text-sm text-erro">Não foi possível carregar as apresentações. Recarregue a página.</p>
      ) : !decks || decks.length === 0 ? (
        <EmptyState
          titulo={
            filtro === "minhas"
              ? "Você ainda não gerou nenhuma apresentação"
              : "Nenhuma apresentação pública ainda"
          }
          texto={
            filtro === "minhas"
              ? "Preencha um briefing e sua primeira apresentação aparece aqui."
              : "Quando alguém da equipe gerar uma apresentação pública, ela aparece aqui para todos."
          }
          cta={filtro === "minhas" ? "Criar agora" : "Criar a primeira"}
          href="/nova"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((d) => {
            // Miniatura = só a capa (1º slide) renderizada isoladamente — evita
            // transferir e embutir o deck inteiro (todos os slides) só pra
            // mostrar uma prévia na listagem.
            const primeiroSlide = (d.slides as Slide[])[0];
            const capa = renderDeck({ titulo: d.titulo, marca: d.marca, modo: d.modo, slides: [primeiroSlide] });
            return (
              <DeckListItem
                key={d.id}
                id={d.id}
                titulo={d.titulo}
                marca={d.marca}
                html={capa}
                autorEmail={d.autor_email}
                createdAt={d.created_at}
                visibilidade={filtro === "minhas" ? d.visibilidade : undefined}
                mostrarAutor={filtro !== "minhas"}
              />
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
