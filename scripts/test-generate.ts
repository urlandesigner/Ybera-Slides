// Teste real de geração (gasta alguns centavos de API): briefing pequeno → deck → HTML.
// Uso: npx tsx scripts/test-generate.ts
import fs from "node:fs";
import { generateDeck } from "../lib/anthropic";
import { renderDeck } from "../lib/renderer";

async function main() {
  const deck = await generateDeck({
    marca: "group",
    modo: "dark",
    assunto: "Resultados do piloto de varejo",
    publico: "Diretoria",
    numSlides: 10,
    conteudo: `O piloto de varejo rodou de março a junho de 2026 em 12 lojas de Campinas e região.
Resultados: 128% da meta de sell-out; recompra 4,2x maior que o canal tradicional; 86 mil clientes ativos ao fim de junho; R$ 12M de receita nova.
Aprendizados: o treinamento das equipes de loja foi decisivo; a logística precisou de um CD dedicado; o preço sugerido funcionou sem descontos.
Próximos passos: expandir para 40 lojas em agosto de 2026, lançar a linha PRO nacionalmente em outubro de 2026, balanço em dezembro de 2026 e rollout nacional em março de 2027.
Frase do diretor comercial Carlos Mendes no kickoff: "O salão indica, o varejo converte — as duas pontas se alimentam."
Contato: comercial@ybera.com / ybera.com. Apresentadora: Ana Ribeiro.`,
  });

  console.log("Deck gerado:", deck.titulo);
  console.log("Slides:", deck.slides.map((s) => s.layout).join(" → "));

  const html = renderDeck(deck);
  fs.writeFileSync("teste-geracao.html", html);
  console.log(`HTML: teste-geracao.html (${html.length} bytes)`);
}

main().catch((err) => {
  console.error("FALHA:", err.message);
  process.exit(1);
});
