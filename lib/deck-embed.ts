// Sobrescritas de exibição só para o iframe embutido no app (miniatura da
// lista e preview do detalhe/editor) — nunca aplicadas ao HTML exportado,
// baixado, ou aberto em aba própria via VISUALIZAR: esses saem sempre
// intactos, com HUD e contador funcionando normalmente.
//
// O script do próprio deck reserva uma "folga de moldura" fora do modo tela
// cheia (escala pra caber em 1960×1140 em vez de 1920×1080), deixando uma
// borda escura ao redor do slide — o fundo do visualizador é sempre quase
// preto, independente do tema claro/escuro do slide. A razão exata pra
// cancelar essa folga é 1140/1080 (~1.055556), mas isso só fecha 100% se o
// elemento embutido for um 16:9 pixel-perfeito — em layouts flex/grid reais,
// arredondamento de subpixel deixa uma tira residual do fundo escuro. Por
// isso escalamos um pouco além do exato (1.08): o excesso é cortado pelo
// próprio overflow:hidden que o body do deck já define, então cobrimos o
// elemento por completo sem depender de proporção perfeita.
export function ajustarHtmlParaEmbutir(
  html: string,
  opcoes: { esconderContador?: boolean; comPonte?: boolean } = {}
): string {
  const regras = [
    "#hud,#drawer{display:none !important}",
    opcoes.esconderContador ? "#contador{display:none !important}" : "",
    "#stage{transform:scale(1.08);transform-origin:center center}",
  ]
    .filter(Boolean)
    .join("");
  const estilo = `<style>${regras}</style>`;
  let saida = html.includes("</head>") ? html.replace("</head>", `${estilo}</head>`) : `${estilo}${html}`;

  // Ponte de navegação: deixa a UI externa (React) dirigir o slide e saber o
  // total. Injetada antes de </body> pra rodar depois do script do próprio deck
  // (que define mostrar() e os .slide). O `mostrar` é global (script clássico),
  // então nossa ponte o alcança pela cadeia de escopo.
  if (opcoes.comPonte) {
    const ponte = [
      "<script>(function(){",
      "function total(){return document.querySelectorAll('#stage .slide').length;}",
      "function avisar(){try{parent.postMessage({tipo:'deck-total',total:total()},'*');}catch(e){}}",
      "window.addEventListener('message',function(e){",
      "if(!e.data)return;",
      "if(e.data.tipo==='ir-para-slide'&&typeof mostrar==='function'){mostrar(e.data.indice);}",
      "});",
      "if(document.readyState==='complete')avisar();else window.addEventListener('load',avisar);",
      "})();</script>",
    ].join("");
    saida = saida.includes("</body>") ? saida.replace("</body>", `${ponte}</body>`) : `${saida}${ponte}`;
  }

  return saida;
}
