import type { Slide } from "./schema";

// Estrutura HTML copiada à risca de template-ybera-referencia.html.
// Apenas os textos viram variáveis — fontes, espaçamentos, cores e estrutura intactos.

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const e = escapeHtml;

function anoDe(data: string): string {
  const m = data.match(/\d{4}/);
  return m ? m[0] : "";
}

function renderCapa(s: Extract<Slide, { layout: "capa" }>): string {
  const ano = anoDe(s.data);
  const selo = ano ? `APRESENTAÇÃO · ${ano}` : "APRESENTAÇÃO";
  return `<section class="slide" data-layout="capa">
  <div class="frame">
    <div style="display: flex; align-items: flex-start; justify-content: space-between;">
      <div style="display: flex; align-items: center; min-height: 92px;"><img data-logo alt="Logo" style="display: block; height: 92px; width: auto; margin-left: -12px;"></div>
      <div style="display: flex; align-items: center; gap: 12px; border: 1px solid var(--accent-border); border-radius: 999px; padding: 12px 28px;">
        <span style="width: 12px; height: 12px; border-radius: 999px; background: var(--accent); display: block;"></span>
        <span class="f-mono" style="font-size: 24px; letter-spacing: 0.12em; color: var(--accent);">${e(selo)}</span>
      </div>
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 40px; max-width: 1360px;">
      <h1 class="f-display" style="margin: 0; font-size: 128px; line-height: 1.05; color: var(--ink); text-wrap: balance;">${e(s.titulo)}</h1>
      <p class="f-body" style="margin: 0; font-size: 36px; line-height: 1.4; color: var(--ink3); max-width: 980px;">${e(s.subtitulo)}</p>
    </div>
    <div style="display: flex; flex-direction: column; gap: 28px;">
      <div style="border-top: 1px solid var(--line18);"></div>
      <div class="header-row">
        <span class="f-body" style="font-weight: 600; font-size: 26px; color: var(--ink);">${e(s.apresentador)}</span>
        <span class="pagenum">${e(s.data)}</span>
      </div>
    </div>
  </div>
</section>`;
}

function renderIndice(s: Extract<Slide, { layout: "indice" }>): string {
  const itens = s.itens
    .map((item, i) => {
      const ultimo = i === s.itens.length - 1;
      const borda = ultimo
        ? "border-top: 1px solid var(--line18); border-bottom: 1px solid var(--line18);"
        : "border-top: 1px solid var(--line18);";
      return `      <div style="display: flex; align-items: baseline; gap: 48px; padding: 44px 0; ${borda}">
        <span class="f-mono" style="font-size: 28px; color: var(--accent); width: 64px; flex-shrink: 0;">${e(item.numero)}</span>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <span class="f-display" style="font-size: 40px; line-height: 1.15; color: var(--ink);">${e(item.titulo)}</span>
          <span class="f-body" style="font-size: 26px; line-height: 1.4; color: var(--ink3);">${e(item.descricao)}</span>
        </div>
      </div>`;
    })
    .join("\n");
  return `<section class="slide" data-layout="indice">
  <div class="frame" style="flex-direction: row; gap: 80px;">
    <div style="width: 480px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: space-between;">
      <div style="display: flex; flex-direction: column; gap: 32px;">
        <span class="kicker">ÍNDICE</span>
        <h2 class="f-display" style="margin: 0; font-size: 88px; line-height: 1.05; color: var(--ink);">${e(s.titulo)}</h2>
      </div>
      <span class="pagenum" data-pagina>00 / 00</span>
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
${itens}
    </div>
  </div>
</section>`;
}

function renderSeparador(s: Extract<Slide, { layout: "separador" }>): string {
  return `<section class="slide separador" data-layout="separador">
  <div class="frame" style="justify-content: space-between;">
    <span class="f-mono" style="font-size: 24px; letter-spacing: 0.12em; color: var(--sep-text);">SEÇÃO</span>
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <span class="f-mono" style="font-size: 40px; letter-spacing: 0.08em; color: color-mix(in srgb, var(--sep-text) 60%, transparent);">${e(s.numero)}</span>
      <h2 class="f-display" style="margin: 0; font-size: 140px; line-height: 1.02; color: var(--sep-text); max-width: 1480px; text-wrap: balance;">${e(s.titulo)}</h2>
    </div>
    <div class="header-row" style="border-top: 1px solid color-mix(in srgb, var(--sep-text) 25%, transparent); padding-top: 28px;">
      <span class="f-body" style="font-weight: 600; font-size: 26px; color: var(--sep-text);">${e(s.linha)}</span>
      <span class="f-mono" data-pagina style="font-size: 24px; letter-spacing: 0.08em; color: color-mix(in srgb, var(--sep-text) 60%, transparent);">00 / 00</span>
    </div>
  </div>
</section>`;
}

function renderConteudo(s: Extract<Slide, { layout: "conteudo" }>): string {
  const paragrafos = s.paragrafos
    .map((p, i) =>
      i === 0
        ? `        <p class="f-body" style="margin: 0; font-size: 30px; line-height: 1.55; color: var(--ink2);">${e(p)}</p>`
        : `        <p class="f-body" style="margin: 0; font-size: 30px; line-height: 1.55; color: var(--ink3);">${e(p)}</p>`
    )
    .join("\n");
  return `<section class="slide" data-layout="conteudo">
  <div class="frame" style="gap: 56px;">
    <div class="header-row">
      <span class="kicker">${e(s.kicker)}</span>
      <span class="pagenum" data-pagina>00 / 00</span>
    </div>
    <h2 class="f-display" style="margin: 0; font-size: 76px; line-height: 1.08; color: var(--ink); max-width: 1200px; text-wrap: balance;">${e(s.titulo)}</h2>
    <div style="flex: 1; display: flex; gap: 96px; align-items: stretch; min-height: 0;">
      <div style="flex: 1; display: flex; flex-direction: column; gap: 36px; justify-content: center; max-width: 780px;">
${paragrafos}
      </div>
      <div style="flex: 1; display: flex; align-items: center;">
        <div class="img-placeholder"><span>${e(s.imagemDescricao)}</span></div>
      </div>
    </div>
  </div>
</section>`;
}

function renderTexto(s: Extract<Slide, { layout: "texto" }>): string {
  const apoio = s.apoio
    ? `\n      <p class="f-body" style="margin: 0; font-size: 32px; line-height: 1.55; color: var(--ink3); max-width: 1100px;">${e(s.apoio)}</p>`
    : "";
  return `<section class="slide" data-layout="texto">
  <div class="frame" style="gap: 56px;">
    <div class="header-row">
      <span class="kicker">${e(s.kicker)}</span>
      <span class="pagenum" data-pagina>00 / 00</span>
    </div>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 48px;">
      <p class="f-display" style="margin: 0; font-size: 72px; line-height: 1.18; color: var(--ink); max-width: 1500px; text-wrap: balance;">${e(s.afirmacao)}</p>${apoio}
    </div>
  </div>
</section>`;
}

function renderImagem(s: Extract<Slide, { layout: "imagem" }>): string {
  // O layout de referência não tem slot de kicker — o campo é aceito no contrato
  // mas não é renderizado, para manter a estrutura idêntica.
  return `<section class="slide" data-layout="imagem">
  <div style="position: absolute; inset: 0; display: flex; flex-direction: column; padding: 64px 64px 48px 64px; box-sizing: border-box; gap: 32px;">
    <div style="flex: 1; min-height: 0;">
      <div class="img-placeholder"><span>${e(s.imagemDescricao)}</span></div>
    </div>
    <div class="header-row" style="padding: 0 56px;">
      <span class="f-body" style="font-weight: 600; font-size: 28px; color: var(--ink);">${e(s.legenda)}</span>
      <span class="pagenum" data-pagina>00 / 00</span>
    </div>
  </div>
</section>`;
}

function renderCitacao(s: Extract<Slide, { layout: "citacao" }>): string {
  return `<section class="slide" data-layout="citacao">
  <div class="frame" style="justify-content: center; gap: 64px;">
    <span class="f-display" style="font-size: 140px; line-height: 0.6; color: var(--accent);">“</span>
    <blockquote class="f-display" style="margin: 0; font-size: 84px; line-height: 1.15; color: var(--ink); max-width: 1480px; text-wrap: balance;">${e(s.frase)}</blockquote>
    <div style="display: flex; align-items: center; gap: 24px;">
      <span style="width: 56px; border-top: 2px solid var(--accent);"></span>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span class="f-body" style="font-weight: 600; font-size: 30px; color: var(--ink);">${e(s.autor)}</span>
        <span class="f-body" style="font-size: 26px; color: var(--ink3);">${e(s.fonte)}</span>
      </div>
    </div>
  </div>
</section>`;
}

function renderCards(s: Extract<Slide, { layout: "cards" }>): string {
  const cards = s.cards
    .map(
      (card, i) => `      <div style="border: 1px solid var(--line18); border-radius: 16px; padding: 48px; display: flex; flex-direction: column; gap: 24px;">
        <span class="f-mono" style="font-size: 26px; color: var(--accent);">${String(i + 1).padStart(2, "0")}</span>
        <span class="f-display" style="font-size: 40px; line-height: 1.15; color: var(--ink);">${e(card.titulo)}</span>
        <span class="f-body" style="font-size: 25px; line-height: 1.5; color: var(--ink3);">${e(card.texto)}</span>
      </div>`
    )
    .join("\n");
  return `<section class="slide" data-layout="cards">
  <div class="frame" style="gap: 64px;">
    <div class="header-row">
      <span class="kicker">${e(s.kicker)}</span>
      <span class="pagenum" data-pagina>00 / 00</span>
    </div>
    <h2 class="f-display" style="margin: 0; font-size: 72px; line-height: 1.08; color: var(--ink); max-width: 1200px;">${e(s.titulo)}</h2>
    <div style="flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;">
${cards}
    </div>
  </div>
</section>`;
}

function renderMetricas(s: Extract<Slide, { layout: "metricas" }>): string {
  // No padrão de referência a primeira métrica usa a cor de acento; as demais usam a tinta.
  const metricas = s.metricas
    .map((m, i) => {
      const cor = i === 0 ? "var(--accent)" : "var(--ink)";
      return `      <div style="display: flex; flex-direction: column; gap: 20px; border-top: 1px solid var(--line18); padding-top: 36px;">
        <span class="f-display" style="font-size: 96px; line-height: 1; color: ${cor};">${e(m.valor)}</span>
        <span class="f-mono" style="font-size: 22px; letter-spacing: 0.1em; color: var(--ink);">${e(m.rotulo)}</span>
        <span class="f-body" style="font-size: 24px; line-height: 1.4; color: var(--ink3);">${e(m.contexto ?? "")}</span>
      </div>`;
    })
    .join("\n");
  return `<section class="slide" data-layout="metricas">
  <div class="frame" style="gap: 64px;">
    <div class="header-row">
      <span class="kicker">${e(s.kicker)}</span>
      <span class="pagenum" data-pagina>00 / 00</span>
    </div>
    <h2 class="f-display" style="margin: 0; font-size: 72px; line-height: 1.08; color: var(--ink); max-width: 1200px;">${e(s.titulo)}</h2>
    <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 56px; align-content: center;">
${metricas}
    </div>
  </div>
</section>`;
}

function renderTimeline(s: Extract<Slide, { layout: "timeline" }>): string {
  const marcos = s.marcos
    .map((m, i) => {
      const ultimo = i === s.marcos.length - 1;
      const wrapper = ultimo
        ? `      <div style="display: flex; flex-direction: column; gap: 28px;">`
        : `      <div style="display: flex; flex-direction: column; gap: 28px; padding-right: 48px;">`;
      const marcador = ultimo
        ? `          <span style="width: 20px; height: 20px; border-radius: 999px; border: 2px solid var(--accent); box-sizing: border-box; background: transparent; flex-shrink: 0;"></span>
          <span style="flex: 1; border-top: 1px dashed var(--line25);"></span>`
        : `          <span style="width: 20px; height: 20px; border-radius: 999px; background: var(--accent); flex-shrink: 0;"></span>
          <span style="flex: 1; border-top: 1px solid var(--line25);"></span>`;
      return `${wrapper}
        <div style="display: flex; align-items: center;">
${marcador}
        </div>
        <span class="f-mono" style="font-size: 24px; letter-spacing: 0.1em; color: var(--accent);">${e(m.rotulo)}</span>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <span class="f-display" style="font-size: 34px; line-height: 1.2; color: var(--ink);">${e(m.titulo)}</span>
          <span class="f-body" style="font-size: 24px; line-height: 1.45; color: var(--ink3);">${e(m.texto)}</span>
        </div>
      </div>`;
    })
    .join("\n");
  return `<section class="slide" data-layout="timeline">
  <div class="frame" style="gap: 64px;">
    <div class="header-row">
      <span class="kicker">${e(s.kicker)}</span>
      <span class="pagenum" data-pagina>00 / 00</span>
    </div>
    <h2 class="f-display" style="margin: 0; font-size: 72px; line-height: 1.08; color: var(--ink); max-width: 1200px;">${e(s.titulo)}</h2>
    <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); align-content: center;">
${marcos}
    </div>
  </div>
</section>`;
}

function renderComparativo(s: Extract<Slide, { layout: "comparativo" }>): string {
  const antes = s.antesItens
    .map(
      (item) => `          <div style="display: flex; gap: 24px; align-items: baseline;">
            <span class="f-mono" style="font-size: 26px; color: var(--ink3); flex-shrink: 0;">–</span>
            <span class="f-body" style="font-size: 27px; line-height: 1.45; color: var(--ink2);">${e(item)}</span>
          </div>`
    )
    .join("\n");
  const depois = s.depoisItens
    .map(
      (item) => `          <div style="display: flex; gap: 24px; align-items: baseline;">
            <span class="f-mono" style="font-size: 26px; color: var(--accent); flex-shrink: 0;">+</span>
            <span class="f-body" style="font-size: 27px; line-height: 1.45; color: var(--ink);">${e(item)}</span>
          </div>`
    )
    .join("\n");
  return `<section class="slide" data-layout="comparativo">
  <div class="frame" style="gap: 64px;">
    <div class="header-row">
      <span class="kicker">${e(s.kicker)}</span>
      <span class="pagenum" data-pagina>00 / 00</span>
    </div>
    <h2 class="f-display" style="margin: 0; font-size: 72px; line-height: 1.08; color: var(--ink); max-width: 1200px;">${e(s.titulo)}</h2>
    <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-content: center;">
      <div style="border: 1px solid var(--line18); border-radius: 16px; padding: 56px; display: flex; flex-direction: column; gap: 36px;">
        <span class="f-mono" style="font-size: 24px; letter-spacing: 0.12em; color: var(--ink3);">${e(s.antesRotulo)}</span>
        <div style="display: flex; flex-direction: column; gap: 28px;">
${antes}
        </div>
      </div>
      <div style="border: 1px solid var(--accent); border-radius: 16px; padding: 56px; display: flex; flex-direction: column; gap: 36px;">
        <span class="f-mono" style="font-size: 24px; letter-spacing: 0.12em; color: var(--accent);">${e(s.depoisRotulo)}</span>
        <div style="display: flex; flex-direction: column; gap: 28px;">
${depois}
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function renderEncerramento(s: Extract<Slide, { layout: "encerramento" }>): string {
  return `<section class="slide" data-layout="encerramento">
  <div class="frame">
    <span class="kicker">ENCERRAMENTO</span>
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 40px; max-width: 1360px;">
      <h2 class="f-display" style="margin: 0; font-size: 128px; line-height: 1.05; color: var(--ink);">${e(s.titulo)}</h2>
      <p class="f-body" style="margin: 0; font-size: 36px; line-height: 1.4; color: var(--ink3); max-width: 980px;">${e(s.texto)}</p>
    </div>
    <div style="display: flex; flex-direction: column; gap: 28px;">
      <div style="border-top: 1px solid var(--line18);"></div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; gap: 64px; align-items: baseline;">
          <span class="f-body" style="font-weight: 600; font-size: 26px; color: var(--ink);">${e(s.email)}</span>
          <span class="pagenum">${e(s.site)}</span>
        </div>
        <div style="display: flex; align-items: center; min-height: 64px;"><img data-logo alt="Logo" style="display: block; height: 64px; width: auto;"></div>
      </div>
    </div>
  </div>
</section>`;
}

export function renderSlide(slide: Slide): string {
  switch (slide.layout) {
    case "capa":
      return renderCapa(slide);
    case "indice":
      return renderIndice(slide);
    case "separador":
      return renderSeparador(slide);
    case "conteudo":
      return renderConteudo(slide);
    case "texto":
      return renderTexto(slide);
    case "imagem":
      return renderImagem(slide);
    case "citacao":
      return renderCitacao(slide);
    case "cards":
      return renderCards(slide);
    case "metricas":
      return renderMetricas(slide);
    case "timeline":
      return renderTimeline(slide);
    case "comparativo":
      return renderComparativo(slide);
    case "encerramento":
      return renderEncerramento(slide);
  }
}
