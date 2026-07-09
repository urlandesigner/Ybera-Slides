import { z } from "zod";

// Contrato do JSON de slides. Campos opcionais são modelados como nullable
// para compatibilidade com structured outputs (todo campo precisa estar em `required`).

export const capaSchema = z.object({
  layout: z.literal("capa"),
  titulo: z.string(),
  subtitulo: z.string(),
  apresentador: z.string(),
  data: z.string(), // ex: "JULHO · 2026"
});

export const indiceSchema = z.object({
  layout: z.literal("indice"),
  titulo: z.string(),
  itens: z
    .array(z.object({ numero: z.string(), titulo: z.string(), descricao: z.string() }))
    .min(2)
    .max(4),
});

export const separadorSchema = z.object({
  layout: z.literal("separador"),
  numero: z.string(),
  titulo: z.string(),
  linha: z.string(),
});

export const conteudoSchema = z.object({
  layout: z.literal("conteudo"),
  kicker: z.string(),
  titulo: z.string(),
  paragrafos: z.array(z.string()).min(1).max(2),
  imagemDescricao: z.string(),
});

export const textoSchema = z.object({
  layout: z.literal("texto"),
  kicker: z.string(),
  afirmacao: z.string(),
  apoio: z.string().nullable(),
});

export const imagemSchema = z.object({
  layout: z.literal("imagem"),
  kicker: z.string(),
  legenda: z.string(),
  imagemDescricao: z.string(),
});

export const citacaoSchema = z.object({
  layout: z.literal("citacao"),
  frase: z.string(),
  autor: z.string(),
  fonte: z.string(),
});

export const cardsSchema = z.object({
  layout: z.literal("cards"),
  kicker: z.string(),
  titulo: z.string(),
  cards: z.array(z.object({ titulo: z.string(), texto: z.string() })).length(3),
});

export const metricasSchema = z.object({
  layout: z.literal("metricas"),
  kicker: z.string(),
  titulo: z.string(),
  metricas: z
    .array(
      z.object({
        valor: z.string(),
        rotulo: z.string(),
        contexto: z.string().nullable(), // linha de contexto opcional (presente no padrão visual)
      })
    )
    .length(4),
});

export const timelineSchema = z.object({
  layout: z.literal("timeline"),
  kicker: z.string(),
  titulo: z.string(),
  marcos: z
    .array(z.object({ rotulo: z.string(), titulo: z.string(), texto: z.string() }))
    .length(4), // o 4º usa o marcador vazado/tracejado
});

export const comparativoSchema = z.object({
  layout: z.literal("comparativo"),
  kicker: z.string(),
  titulo: z.string(),
  antesRotulo: z.string(),
  antesItens: z.array(z.string()).length(3),
  depoisRotulo: z.string(),
  depoisItens: z.array(z.string()).length(3),
});

export const encerramentoSchema = z.object({
  layout: z.literal("encerramento"),
  titulo: z.string(),
  texto: z.string(),
  email: z.string(),
  site: z.string(),
});

export const slideSchema = z.discriminatedUnion("layout", [
  capaSchema,
  indiceSchema,
  separadorSchema,
  conteudoSchema,
  textoSchema,
  imagemSchema,
  citacaoSchema,
  cardsSchema,
  metricasSchema,
  timelineSchema,
  comparativoSchema,
  encerramentoSchema,
]);

export const marcaSchema = z.enum(["group", "ybera", "club", "pro"]);
export const modoSchema = z.enum(["dark", "light"]);

export const deckSchema = z.object({
  titulo: z.string(),
  marca: marcaSchema,
  modo: modoSchema,
  slides: z.array(slideSchema).min(4).max(24),
});

export type Deck = z.infer<typeof deckSchema>;
export type Slide = z.infer<typeof slideSchema>;
export type Marca = z.infer<typeof marcaSchema>;
export type Modo = z.infer<typeof modoSchema>;

// Briefing preenchido pelo funcionário
export const briefingSchema = z.object({
  marca: marcaSchema,
  modo: modoSchema,
  assunto: z.string().min(3, "Descreva o assunto da apresentação"),
  publico: z.string().min(3, "Descreva o público-alvo"),
  numSlides: z.union([z.literal(10), z.literal(14), z.literal(18)]),
  conteudo: z.string().min(40, "Cole o conteúdo a cobrir — pontos, dados e fatos"),
});

export type Briefing = z.infer<typeof briefingSchema>;
