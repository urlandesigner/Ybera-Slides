import { NextResponse } from "next/server";
import { briefingSchema } from "@/lib/schema";
import { generateDeck, GenerationError } from "@/lib/anthropic";
import { renderDeck } from "@/lib/renderer";
import { createClient } from "@/lib/supabase/server";

// Geração pode levar mais de um minuto — timeout de 120s.
export const maxDuration = 120;

const LIMITE_DIARIO = 10;

export async function POST(request: Request) {
  const supabase = await createClient();

  // 1. Sessão válida
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Sessão expirada. Entre de novo.", codigo: "sessao" }, { status: 401 });
  }

  // 2. Briefing válido
  let briefing;
  try {
    briefing = briefingSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ erro: "Briefing incompleto ou inválido", codigo: "briefing" }, { status: 400 });
  }

  // 3. Rate limit: 10 gerações/usuário/dia, contadas na tabela decks (dia UTC)
  const inicioDoDia = new Date();
  inicioDoDia.setUTCHours(0, 0, 0, 0);
  const { count, error: countError } = await supabase
    .from("decks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("origem", "geracao") // edições salvas não consomem a cota
    .gte("created_at", inicioDoDia.toISOString());
  if (countError) {
    console.error("[generate] erro ao contar gerações:", countError.message);
    return NextResponse.json({ erro: "Erro ao verificar seu limite diário", codigo: "interno" }, { status: 500 });
  }
  if ((count ?? 0) >= LIMITE_DIARIO) {
    return NextResponse.json(
      { erro: `Limite de ${LIMITE_DIARIO} gerações por dia atingido. Volte amanhã.`, codigo: "limite" },
      { status: 429 }
    );
  }

  // 4. Gera o JSON de slides (com 1 retry interno para JSON inválido)
  let deck;
  try {
    deck = await generateDeck(briefing);
  } catch (err) {
    if (err instanceof GenerationError) {
      console.error("[generate] falha de geração:", err.kind, err.message);
      const status = err.kind === "invalid_json" ? 502 : 502;
      return NextResponse.json({ erro: err.message, codigo: err.kind }, { status });
    }
    console.error("[generate] erro inesperado:", err);
    return NextResponse.json(
      { erro: "Erro inesperado ao gerar a apresentação. Tente de novo.", codigo: "interno" },
      { status: 500 }
    );
  }

  // 5. Renderiza o HTML final (a IA nunca gera HTML)
  const html = renderDeck(deck);

  // 6. Salva no histórico
  const { data: saved, error: insertError } = await supabase
    .from("decks")
    .insert({
      user_id: user.id,
      autor_email: user.email ?? "",
      titulo: deck.titulo,
      marca: deck.marca,
      modo: deck.modo,
      briefing,
      slides: deck.slides,
      html,
      origem: "geracao",
    })
    .select("id")
    .single();
  if (insertError || !saved) {
    console.error("[generate] erro ao salvar deck:", insertError?.message);
    return NextResponse.json(
      { erro: "A apresentação foi gerada mas não pôde ser salva. Tente de novo.", codigo: "interno" },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: saved.id, titulo: deck.titulo, html });
}
