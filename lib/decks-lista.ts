import { renderDeck } from "@/lib/renderer";
import type { Slide } from "@/lib/schema";
import type { createClient } from "@/lib/supabase/server";

export type Filtro = "minhas" | "publicas";

export type DeckResumo = {
  id: string;
  titulo: string;
  marca: string;
  capa: string;
  autorEmail: string;
  createdAt: string;
  visibilidade: string;
};

// Reaproveitado pelo SSR inicial da página e pela rota GET /api/decks (troca
// de aba no cliente) — mesma consulta e mesma lógica de miniatura nos dois.
export async function buscarDecks(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filtro: Filtro,
  userId: string
): Promise<{ decks: DeckResumo[] | null; erro: boolean }> {
  const query = supabase
    .from("decks")
    .select("id, titulo, marca, modo, slides, autor_email, created_at, visibilidade")
    .order("created_at", { ascending: false })
    .limit(200);

  const { data, error } =
    filtro === "minhas" ? await query.eq("user_id", userId) : await query.eq("visibilidade", "publica");

  if (error || !data) return { decks: null, erro: true };

  const decks: DeckResumo[] = data.map((d) => {
    // Miniatura = só a capa (1º slide) renderizada isoladamente — evita
    // transferir e embutir o deck inteiro (todos os slides) só pra mostrar
    // uma prévia na listagem.
    const primeiroSlide = (d.slides as Slide[])[0];
    const capa = renderDeck({ titulo: d.titulo, marca: d.marca, modo: d.modo, slides: [primeiroSlide] });
    return {
      id: d.id,
      titulo: d.titulo,
      marca: d.marca,
      capa,
      autorEmail: d.autor_email,
      createdAt: d.created_at,
      visibilidade: d.visibilidade,
    };
  });

  return { decks, erro: false };
}
