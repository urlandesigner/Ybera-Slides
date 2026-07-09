// Gera um deck de amostra com todos os layouts e valida que os blocos imutáveis
// (style, HUD, logos-data, visualizador) estão idênticos ao arquivo de referência.
// Uso: npx tsx scripts/render-sample.ts [saida.html]
import fs from "node:fs";
import { renderDeck } from "../lib/renderer";
import { STYLE_BLOCK, HUD_HTML, LOGOS_SCRIPT, VIEWER_SCRIPT } from "../lib/reference";
import { deckSchema, type Deck } from "../lib/schema";

const sample: Deck = {
  titulo: "Plano comercial 2026",
  marca: "group",
  modo: "dark",
  slides: [
    { layout: "capa", titulo: "Plano comercial 2026", subtitulo: "Direção, metas e frentes de trabalho para o próximo ciclo", apresentador: "Ana Ribeiro", data: "JULHO · 2026" },
    {
      layout: "indice",
      titulo: "O que vamos ver",
      itens: [
        { numero: "01", titulo: "Contexto", descricao: "Onde estamos e o que mudou no mercado" },
        { numero: "02", titulo: "Resultados", descricao: "Números do último semestre" },
        { numero: "03", titulo: "Plano", descricao: "Frentes, cronograma e próximos passos" },
      ],
    },
    { layout: "separador", numero: "01", titulo: "Contexto", linha: "Onde estamos e o que mudou no mercado" },
    {
      layout: "conteudo",
      kicker: "01 · CONTEXTO",
      titulo: "O varejo de beleza mudou de ritmo",
      paragrafos: [
        "O canal profissional segue sendo a base da marca, mas o consumidor final passou a comprar direto com frequência três vezes maior.",
        "Isso abre espaço para uma estratégia de duas pontas sem canibalizar o salão.",
      ],
      imagemDescricao: "foto de salão parceiro",
    },
    { layout: "texto", kicker: "01 · CONTEXTO", afirmacao: "Crescer no varejo sem perder o salão é a tese central deste plano.", apoio: "Cada frente descrita aqui protege uma das duas pontas." },
    { layout: "imagem", kicker: "01 · CONTEXTO", legenda: "Nova linha em gôndola — piloto de Campinas", imagemDescricao: "foto da gôndola do piloto" },
    { layout: "citacao", frase: "O salão indica, o varejo converte — as duas pontas se alimentam.", autor: "Carlos Mendes", fonte: "Diretor Comercial, kickoff 2026" },
    { layout: "separador", numero: "02", titulo: "Resultados", linha: "Números do último semestre" },
    {
      layout: "metricas",
      kicker: "02 · RESULTADOS",
      titulo: "Números que importam",
      metricas: [
        { valor: "128%", rotulo: "META DO SEMESTRE", contexto: "Atingimento sobre o plano" },
        { valor: "4,2x", rotulo: "RECOMPRA", contexto: "Frequência vs. 2024" },
        { valor: "86k", rotulo: "CLIENTES ATIVOS", contexto: "Base ao fim de junho" },
        { valor: "R$ 12M", rotulo: "RECEITA NOVA", contexto: "Somente canais digitais" },
      ],
    },
    {
      layout: "cards",
      kicker: "02 · RESULTADOS",
      titulo: "Três frentes que puxaram o resultado",
      cards: [
        { titulo: "Educação", texto: "Trilhas de formação para 1.200 profissionais parceiros." },
        { titulo: "Distribuição", texto: "Novos CDs reduziram o prazo médio de entrega em 40%." },
        { titulo: "Digital", texto: "Loja própria passou a responder por 18% da receita." },
      ],
    },
    {
      layout: "comparativo",
      kicker: "02 · RESULTADOS",
      titulo: "Antes e depois da reestruturação",
      antesRotulo: "ANTES",
      antesItens: ["Prazo médio de entrega de 9 dias", "Cobertura em 12 estados", "Sem canal direto ao consumidor"],
      depoisRotulo: "DEPOIS",
      depoisItens: ["Entrega em até 5 dias", "Cobertura nacional", "Loja própria com 18% da receita"],
    },
    { layout: "separador", numero: "03", titulo: "Plano", linha: "Frentes, cronograma e próximos passos" },
    {
      layout: "timeline",
      kicker: "03 · PLANO",
      titulo: "Cronograma do próximo ciclo",
      marcos: [
        { rotulo: "AGO 2026", titulo: "Piloto varejo", texto: "Expansão do piloto para 40 lojas." },
        { rotulo: "OUT 2026", titulo: "Nova linha", texto: "Lançamento nacional da linha PRO." },
        { rotulo: "DEZ 2026", titulo: "Balanço", texto: "Revisão de metas e ajuste de rota." },
        { rotulo: "MAR 2027", titulo: "Escala", texto: "Rollout para todas as regiões." },
      ],
    },
    { layout: "encerramento", titulo: "Obrigado.", texto: "Dúvidas, comentários ou próximos passos — vamos conversar.", email: "comercial@ybera.com", site: "ybera.com" },
  ],
};

const deck = deckSchema.parse(sample);
const html = renderDeck(deck);

const out = process.argv[2] ?? "sample-deck.html";
fs.writeFileSync(out, html);
console.log(`OK: ${out} (${html.length} bytes, ${deck.slides.length} slides)`);

// Critério de aceite 3: blocos imutáveis presentes sem alterações
for (const [nome, bloco] of [
  ["style", STYLE_BLOCK],
  ["hud", HUD_HTML],
  ["logos-data", LOGOS_SCRIPT],
  ["visualizador", VIEWER_SCRIPT],
] as const) {
  if (!html.includes(bloco)) {
    console.error(`FALHA: bloco "${nome}" não está byte-idêntico no HTML gerado`);
    process.exit(1);
  }
  console.log(`OK: bloco "${nome}" idêntico ao arquivo de referência`);
}
