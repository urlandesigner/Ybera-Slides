import { FONT_LINKS, HUD_HTML, LOGOS_SCRIPT, STYLE_BLOCK, VIEWER_SCRIPT } from "./reference";
import { escapeHtml, renderSlide } from "./layouts";
import type { Deck } from "./schema";

// CSS extra p/ fotos reais — o arquivo de referência é imutável (só placeholders).
const IMAGE_MEDIA_STYLE = `<style>
.img-media {
  width: 100%; height: 100%; border-radius: 16px; overflow: hidden;
  background: var(--hairline);
}
.img-media img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
</style>`;

// Monta o HTML final, auto-contido, na ordem exigida pelo padrão:
// 1. <head> + <style> do arquivo de referência, sem alterações
// 2. <body data-marca data-tom> + HUD/drawer/contador do visualizador
// 3. <div id="stage"> com os slides renderizados
// 4. <script id="logos-data"> do arquivo de referência, sem alterações
// 5. <script> do visualizador, sem alterações
// Números de página são placeholders "00 / 00" — o numerar() do visualizador preenche.
export function renderDeck(deck: Deck): string {
  const slides = deck.slides.map(renderSlide).join("\n\n");
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(deck.titulo)}</title>
${FONT_LINKS}
${STYLE_BLOCK}
${IMAGE_MEDIA_STYLE}
</head>
<body data-marca="${deck.marca}" data-tom="${deck.modo}">

${HUD_HTML}

<div id="stage">

${slides}

</div>

${LOGOS_SCRIPT}
${VIEWER_SCRIPT}
</body>
</html>
`;
}
