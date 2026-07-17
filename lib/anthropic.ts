import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { deckSchema, type Briefing, type Deck } from "./schema";

const MODEL = "claude-sonnet-5";

// A IA responde SOMENTE chamando esta ferramenta — o input é o JSON do deck.
// (Structured outputs com gramática compilada não comporta um contrato deste
// tamanho — "compiled grammar is too large" — então usamos tool use forçado,
// que garante JSON sintaticamente válido, + validação Zod com retry.)
const DECK_TOOL_NAME = "emitir_deck";
const DECK_INPUT_SCHEMA = z.toJSONSchema(deckSchema) as Anthropic.Tool.InputSchema;

// System prompt grande e idêntico entre chamadas — marcado com cache_control.
const SYSTEM_PROMPT = `Você é o gerador de apresentações do Grupo Ybera. A partir de um briefing, você produz o conteúdo de uma apresentação corporativa no padrão visual da empresa. Você NUNCA gera HTML — você responde somente chamando a ferramenta ${DECK_TOOL_NAME} com um JSON estruturado com o conteúdo dos slides, que um renderizador injeta em templates fixos.

## Contrato do JSON

type Deck = {
  titulo: string;               // título curto da apresentação
  marca: "group" | "ybera" | "club" | "pro";
  modo: "dark" | "light";
  slides: Slide[];
};

type Slide =
  | { layout: "capa"; titulo: string; subtitulo: string; apresentador: string; data: string }            // data ex: "JULHO · 2026"
  | { layout: "indice"; titulo: string; itens: { numero: string; titulo: string; descricao: string }[] } // 2 a 4 itens; numero ex: "01"
  | { layout: "separador"; numero: string; titulo: string; linha: string }
  | { layout: "conteudo"; kicker: string; titulo: string; paragrafos: string[]; imagemDescricao: string; imagemUrl: null; usarImagem: true } // 1-2 parágrafos; imagemUrl sempre null (upload só no editor)
  | { layout: "texto"; kicker: string; afirmacao: string; apoio: string | null }
  | { layout: "imagem"; kicker: string; legenda: string; imagemDescricao: string; imagemUrl: null; usarImagem: true }
  | { layout: "citacao"; frase: string; autor: string; fonte: string }
  | { layout: "cards"; kicker: string; titulo: string; cards: { titulo: string; texto: string }[] }       // 1 a 5 cards
  | { layout: "metricas"; kicker: string; titulo: string; metricas: { valor: string; rotulo: string; contexto: string | null }[] } // exatamente 4
  | { layout: "timeline"; kicker: string; titulo: string; marcos: { rotulo: string; titulo: string; texto: string }[] }            // exatamente 4; o 4º usa marcador vazado/tracejado (futuro/planejado)
  | { layout: "comparativo"; kicker: string; titulo: string; antesRotulo: string; antesItens: string[]; depoisRotulo: string; depoisItens: string[] } // 3 itens cada
  | { layout: "encerramento"; titulo: string; texto: string; email: string; site: string };

## Os layouts e quando usar cada um

1. capa — sempre o PRIMEIRO slide. Título forte, subtítulo com contexto/tema/público, nome do apresentador e data em caixa alta no formato "MÊS · ANO".
2. indice — sempre o SEGUNDO slide. 2 a 4 itens que espelham as seções da apresentação (numero "01", "02"...). titulo curto tipo "O que vamos ver".
3. separador — abre cada seção. numero da seção ("01", "02"...), titulo é o nome da seção, linha é uma frase sobre o que vem na seção.
4. conteudo — o layout de trabalho: texto à esquerda + imagem à direita. Use para explicar um tópico. imagemDescricao descreve a imagem ideal (vira placeholder). imagemUrl deve ser sempre null. usarImagem deve ser sempre true.
5. texto — uma afirmação central grande, sem imagem. Use para a ideia-chave de uma seção, uma tese, uma conclusão parcial. apoio é opcional (null se a afirmação bastar sozinha).
6. imagem — imagem em destaque full-bleed com legenda. Use quando a imagem É a mensagem (produto, resultado visual, foto de evento). imagemUrl deve ser sempre null. usarImagem deve ser sempre true.
7. citacao — frase curta e memorável com autor e fonte. Use APENAS se o briefing fornecer uma citação real.
8. cards — 1 a 5 pontos paralelos (pilares, benefícios, frentes de trabalho). Prefira 3 quando couber; use 4–5 só se o briefing pedir muitos itens distintos.
9. metricas — exatamente 4 números em destaque. valor curto ("128%", "4,2x", "R$ 12M"), rotulo em CAIXA ALTA, contexto é uma linha opcional. Use APENAS se o briefing fornecer os números.
10. timeline — exatamente 4 marcos cronológicos. rotulo em caixa alta ("JAN 2026"), o 4º marco representa o passo futuro/planejado.
11. comparativo — antes/depois ou atual/proposto, 3 itens de cada lado. Rótulos em caixa alta ("ANTES"/"DEPOIS", "HOJE"/"COM O PROJETO").
12. encerramento — sempre o ÚLTIMO slide. titulo curto ("Obrigado."), texto de fechamento, email e site de contato. Se o briefing não trouxer contato, use "contato@ybera.com" e "ybera.com".

## Regras de conteúdo (padrão Ybera)

- Estrutura obrigatória: capa → indice → separador por seção → slides variados → encerramento (sempre o último).
- Uma ideia por slide. 2–3 frases por bloco de texto, no máximo. Deixe o texto respirar.
- Nunca repita o mesmo layout mais de 2 vezes seguidas.
- NÃO invente dados, números, nomes ou citações. Use somente o conteúdo fornecido no briefing. Se faltar conteúdo para "metricas" ou "citacao", NÃO use esses layouts.
- Kickers em CAIXA ALTA com o número da seção: "01 · FUNDAMENTOS", "02 · RESULTADOS". Todos os slides de uma mesma seção compartilham o mesmo kicker.
- Os itens do indice devem corresponder aos separadores de seção (mesmos números e temas).
- Escreva em português do Brasil, tom profissional e direto, sem jargão vazio.
- Adeque a profundidade e o vocabulário ao público informado no briefing.
- Respeite o número aproximado de slides pedido (±2).
- Responda SOMENTE com a chamada da ferramenta ${DECK_TOOL_NAME} — nenhum texto fora dela.`;

export class GenerationError extends Error {
  constructor(message: string, readonly kind: "invalid_json" | "api_error") {
    super(message);
    this.name = "GenerationError";
  }
}

function briefingToPrompt(briefing: Briefing): string {
  return `## Briefing

- Marca: ${briefing.marca}
- Modo: ${briefing.modo}
- Assunto: ${briefing.assunto}
- Público: ${briefing.publico}
- Número aproximado de slides: ${briefing.numSlides === "auto" ? "sem alvo fixo — decida com base no volume e na natureza do conteúdo, tipicamente entre 8 e 15" : briefing.numSlides}

## Conteúdo a cobrir (única fonte de fatos, dados e números — não invente nada além disto)

${briefing.conteudo}`;
}

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[generate] ANTHROPIC_API_KEY ausente no ambiente");
    throw new GenerationError(
      "A geração ainda não foi configurada neste servidor (chave da API ausente). Avise quem administra o app.",
      "api_error"
    );
  }
  return new Anthropic({ timeout: 100_000, maxRetries: 1 });
}

async function callOnce(client: Anthropic, userPrompt: string): Promise<Deck> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    // Tool choice forçado exige thinking desligado — e a tarefa não precisa dele.
    thinking: { type: "disabled" },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [
      {
        name: DECK_TOOL_NAME,
        description:
          "Emite o conteúdo completo da apresentação como JSON estruturado, seguindo o contrato Deck.",
        input_schema: DECK_INPUT_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: DECK_TOOL_NAME },
    messages: [{ role: "user", content: userPrompt }],
  });

  if (response.stop_reason === "refusal") {
    throw new GenerationError("A geração foi recusada pelo modelo", "api_error");
  }

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new GenerationError("O modelo não retornou o JSON do deck", "invalid_json");
  }

  // Zod valida o contrato (contagens exatas, enums, campos obrigatórios)
  return deckSchema.parse(toolUse.input);
}

// Gera o deck a partir do briefing. JSON inválido → 1 retry automático antes de erro.
export async function generateDeck(briefing: Briefing): Promise<Deck> {
  const client = getClient();
  const userPrompt = briefingToPrompt(briefing);

  let deck: Deck;
  try {
    deck = await callOnce(client, userPrompt);
  } catch (firstError) {
    if (firstError instanceof Anthropic.APIConnectionError) {
      throw new GenerationError("Falha de conexão com a API de geração", "api_error");
    }
    if (firstError instanceof Anthropic.APIError) {
      console.error("[generate] erro da API:", firstError.status, firstError.message?.slice(0, 300));
      throw new GenerationError(`Erro da API de geração (${firstError.status})`, "api_error");
    }
    // JSON fora do contrato (contagens erradas, campos faltando) — tenta mais uma vez
    const detalhe = firstError instanceof Error ? firstError.message : String(firstError);
    try {
      deck = await callOnce(
        client,
        `${userPrompt}\n\n## Atenção\n\nSua resposta anterior violou o contrato JSON (${detalhe.slice(0, 500)}). Gere novamente respeitando exatamente o contrato: cards = 1 a 5 itens, metricas = 4, timeline = 4 marcos, comparativo = 3 itens de cada lado.`
      );
    } catch {
      throw new GenerationError(
        "A IA retornou um JSON inválido mesmo após uma nova tentativa. Tente gerar de novo.",
        "invalid_json"
      );
    }
  }

  // Marca e modo são decisões do formulário, não da IA
  deck.marca = briefing.marca;
  deck.modo = briefing.modo;
  // Foto só via upload no editor — nunca aceite URL inventada pela IA
  deck.slides = deck.slides.map((s) =>
    s.layout === "conteudo" || s.layout === "imagem"
      ? { ...s, imagemUrl: null, usarImagem: true }
      : s
  );

  const check = deckSchema.safeParse(deck);
  if (!check.success) {
    throw new GenerationError("O JSON gerado não passou na validação final", "invalid_json");
  }
  return check.data;
}
