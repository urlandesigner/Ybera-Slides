import { NextResponse } from "next/server";
import { z } from "zod";
import { buscarDecks, type Filtro } from "@/lib/decks-lista";
import { deckSchema } from "@/lib/schema";
import { renderDeck } from "@/lib/renderer";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  sourceId: z.string().uuid(),
  deck: deckSchema,
});

// Troca de aba (Públicas/Minhas) no cliente — busca sob demanda, com cache
// no componente cliente, pra não refazer a consulta a cada clique na aba.
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Sessão expirada. Entre de novo." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filtro: Filtro = searchParams.get("filtro") === "minhas" ? "minhas" : "publicas";

  const { decks, erro } = await buscarDecks(supabase, filtro, user.id);
  if (erro || !decks) {
    return NextResponse.json({ erro: "Não foi possível carregar as apresentações." }, { status: 500 });
  }

  return NextResponse.json({ decks });
}

// Salva um deck editado como NOVA versão no histórico (o original é imutável).
// Não chama a IA e não conta no limite diário de gerações (origem = 'edicao').
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Sessão expirada. Entre de novo.", codigo: "sessao" }, { status: 401 });
  }

  let body;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ erro: "Conteúdo editado inválido", codigo: "briefing" }, { status: 400 });
  }

  // Herda briefing e visibilidade do deck de origem
  const { data: origem } = await supabase
    .from("decks")
    .select("briefing, visibilidade, user_id")
    .eq("id", body.sourceId)
    .single();
  if (!origem) {
    return NextResponse.json({ erro: "Apresentação de origem não encontrada", codigo: "interno" }, { status: 404 });
  }
  // Editar é ação de dono — mesmo apresentações públicas só o autor pode salvar nova versão.
  if (origem.user_id !== user.id) {
    return NextResponse.json(
      { erro: "Você não tem permissão para editar esta apresentação", codigo: "permissao" },
      { status: 403 }
    );
  }

  // O HTML é sempre re-renderizado no servidor — nunca aceito do client
  const html = renderDeck(body.deck);

  const { data: saved, error } = await supabase
    .from("decks")
    .insert({
      user_id: user.id,
      autor_email: user.email ?? "",
      titulo: body.deck.titulo,
      marca: body.deck.marca,
      modo: body.deck.modo,
      briefing: origem.briefing,
      slides: body.deck.slides,
      html,
      origem: "edicao",
      visibilidade: origem.visibilidade,
    })
    .select("id")
    .single();
  if (error || !saved) {
    console.error("[decks] erro ao salvar versão editada:", error?.message);
    return NextResponse.json({ erro: "Não foi possível salvar a nova versão", codigo: "interno" }, { status: 500 });
  }

  return NextResponse.json({ id: saved.id });
}
