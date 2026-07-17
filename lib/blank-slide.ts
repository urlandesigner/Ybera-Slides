import type { Slide } from "./schema";

export const LAYOUTS_DISPONIVEIS = [
  "capa",
  "indice",
  "separador",
  "conteudo",
  "texto",
  "imagem",
  "citacao",
  "cards",
  "metricas",
  "timeline",
  "comparativo",
  "encerramento",
] as const;

export type LayoutDisponivel = (typeof LAYOUTS_DISPONIVEIS)[number];

export const SLIDES_MIN = 4;
export const SLIDES_MAX = 24;

/** Slide em branco válido pro contrato — só textos placeholder pra editar depois. */
export function createBlankSlide(layout: LayoutDisponivel): Slide {
  switch (layout) {
    case "capa":
      return {
        layout: "capa",
        titulo: "Título da capa",
        subtitulo: "Subtítulo",
        apresentador: "Apresentador",
        data: "MÊS · ANO",
      };
    case "indice":
      return {
        layout: "indice",
        titulo: "O que vamos ver",
        itens: [
          { numero: "01", titulo: "Seção 1", descricao: "Descrição curta" },
          { numero: "02", titulo: "Seção 2", descricao: "Descrição curta" },
        ],
      };
    case "separador":
      return {
        layout: "separador",
        numero: "01",
        titulo: "Nova seção",
        linha: "Linha de apoio",
      };
    case "conteudo":
      return {
        layout: "conteudo",
        kicker: "SEÇÃO",
        titulo: "Título do conteúdo",
        paragrafos: ["Primeiro parágrafo."],
        imagemDescricao: "descrição da imagem",
        imagemUrl: null,
        usarImagem: true,
      };
    case "texto":
      return {
        layout: "texto",
        kicker: "SEÇÃO",
        afirmacao: "Afirmação principal do slide.",
        apoio: null,
      };
    case "imagem":
      return {
        layout: "imagem",
        kicker: "SEÇÃO",
        legenda: "Legenda da imagem",
        imagemDescricao: "descrição da imagem",
        imagemUrl: null,
        usarImagem: true,
      };
    case "citacao":
      return {
        layout: "citacao",
        frase: "Frase de destaque.",
        autor: "Autor",
        fonte: "Fonte",
      };
    case "cards":
      return {
        layout: "cards",
        kicker: "SEÇÃO",
        titulo: "Título dos cards",
        cards: [
          { titulo: "Card 1", texto: "Texto do card." },
          { titulo: "Card 2", texto: "Texto do card." },
          { titulo: "Card 3", texto: "Texto do card." },
        ],
      };
    case "metricas":
      return {
        layout: "metricas",
        kicker: "SEÇÃO",
        titulo: "Números que importam",
        metricas: [
          { valor: "—", rotulo: "MÉTRICA 1", contexto: null },
          { valor: "—", rotulo: "MÉTRICA 2", contexto: null },
          { valor: "—", rotulo: "MÉTRICA 3", contexto: null },
          { valor: "—", rotulo: "MÉTRICA 4", contexto: null },
        ],
      };
    case "timeline":
      return {
        layout: "timeline",
        kicker: "SEÇÃO",
        titulo: "Cronograma",
        marcos: [
          { rotulo: "MARCO 1", titulo: "Título", texto: "Descrição." },
          { rotulo: "MARCO 2", titulo: "Título", texto: "Descrição." },
          { rotulo: "MARCO 3", titulo: "Título", texto: "Descrição." },
          { rotulo: "MARCO 4", titulo: "Título", texto: "Descrição." },
        ],
      };
    case "comparativo":
      return {
        layout: "comparativo",
        kicker: "SEÇÃO",
        titulo: "Antes e depois",
        antesRotulo: "ANTES",
        antesItens: ["Item 1", "Item 2", "Item 3"],
        depoisRotulo: "DEPOIS",
        depoisItens: ["Item 1", "Item 2", "Item 3"],
      };
    case "encerramento":
      return {
        layout: "encerramento",
        titulo: "Obrigado.",
        texto: "Dúvidas ou próximos passos — vamos conversar.",
        email: "contato@ybera.com",
        site: "ybera.com",
      };
  }
}
