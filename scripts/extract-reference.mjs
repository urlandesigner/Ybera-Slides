// Extrai os blocos imutáveis do template-ybera-referencia.html e gera lib/reference.ts.
// Rodar uma única vez (ou quando o arquivo de referência mudar): node scripts/extract-reference.mjs
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const src = fs.readFileSync(path.join(root, "template-ybera-referencia.html"), "utf8");

function slice(startMarker, endMarker, { includeEnd = true } = {}) {
  const start = src.indexOf(startMarker);
  if (start === -1) throw new Error(`marcador não encontrado: ${startMarker}`);
  const end = src.indexOf(endMarker, start);
  if (end === -1) throw new Error(`marcador de fim não encontrado: ${endMarker}`);
  return src.slice(start, includeEnd ? end + endMarker.length : end);
}

// <style> completo, sem alterações
const styleBlock = slice("<style>", "</style>");

// Links de fonte do <head>
const fontLinks = slice('<link rel="preconnect"', 'display=swap" rel="stylesheet">');

// HUD + drawer + contador do visualizador
const hudHtml = slice('<div id="hud">', '<div id="contador"></div>');

// <script id="logos-data"> sem o script cloudflare email-decode que o precede
const logosScript = slice('<script id="logos-data"', "</script>");

// <script> do visualizador, sem alterações
const viewerScript = slice("<script>\n/* ===== Visualizador", "</script>");

const out = `// GERADO por scripts/extract-reference.mjs a partir de template-ybera-referencia.html.
// Não editar à mão — estes blocos devem permanecer idênticos ao arquivo de referência.

export const FONT_LINKS = ${JSON.stringify(fontLinks)};

export const STYLE_BLOCK = ${JSON.stringify(styleBlock)};

export const HUD_HTML = ${JSON.stringify(hudHtml)};

export const LOGOS_SCRIPT = ${JSON.stringify(logosScript)};

export const VIEWER_SCRIPT = ${JSON.stringify(viewerScript)};
`;

fs.mkdirSync(path.join(root, "lib"), { recursive: true });
fs.writeFileSync(path.join(root, "lib/reference.ts"), out);
console.log("lib/reference.ts gerado:");
console.log("  style:", styleBlock.length, "bytes");
console.log("  fonts:", fontLinks.length, "bytes");
console.log("  hud:", hudHtml.length, "bytes");
console.log("  logos:", logosScript.length, "bytes");
console.log("  viewer:", viewerScript.length, "bytes");
