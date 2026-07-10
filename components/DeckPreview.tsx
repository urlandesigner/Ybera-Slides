"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { ajustarHtmlParaEmbutir } from "@/lib/deck-embed";

function slugify(titulo: string): string {
  return (
    titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "apresentacao"
  );
}

// Preview do deck em iframe isolado + ações. O HTML é auto-contido;
// allow-scripts é necessário para o visualizador (setas, escala, logos).
//
// navegavel: troca o contador interno do slide pela navegação externa
// (← N/total → centralizada abaixo do preview), via ponte de postMessage.
// slideAtivo + onSlideChange (opcionais): modo controlado — o pai é dono do
// índice (o editor sincroniza a lista de slides com as setas daqui).
// A engrenagem de configurações não aparece em nenhum embed (só na apresentação
// aberta via VISUALIZAR ou no arquivo baixado). VISUALIZAR/DOWNLOAD sempre usam
// o HTML original (`exportavel`), nunca a versão ajustada pro embed.
export function DeckPreview({
  html,
  htmlExport,
  titulo,
  actions,
  slideAtivo,
  onSlideChange,
  navegavel = false,
}: {
  html: string;
  htmlExport?: string; // HTML puro para baixar/visualizar (default: o mesmo do preview)
  titulo: string;
  actions?: React.ReactNode;
  slideAtivo?: number;
  onSlideChange?: (indice: number) => void;
  navegavel?: boolean;
}) {
  const exportavel = htmlExport ?? html;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [idxInterno, setIdxInterno] = useState(0);
  const [total, setTotal] = useState(1);

  const controlado = slideAtivo != null;
  const indice = controlado ? slideAtivo : idxInterno;

  const postar = useCallback((n: number) => {
    iframeRef.current?.contentWindow?.postMessage({ tipo: "ir-para-slide", indice: n }, "*");
  }, []);

  // Sincroniza o iframe quando o índice muda — e quando o srcdoc recarrega
  // após uma edição (o novo documento nasce no slide 1).
  useEffect(() => {
    postar(indice);
  }, [postar, indice, html]);

  // Conteúdo novo (outra apresentação) reinicia a navegação interna
  useEffect(() => {
    setIdxInterno(0);
  }, [html]);

  // A ponte injetada no iframe reporta quantos slides existem
  useEffect(() => {
    if (!navegavel) return;
    function aoReceber(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (e.data?.tipo === "deck-total" && typeof e.data.total === "number") {
        setTotal(Math.max(1, e.data.total));
      }
    }
    window.addEventListener("message", aoReceber);
    return () => window.removeEventListener("message", aoReceber);
  }, [navegavel]);

  const irPara = useCallback(
    (n: number) => {
      const alvo = Math.min(Math.max(n, 0), Math.max(total - 1, 0));
      if (controlado) {
        onSlideChange?.(alvo);
      } else {
        setIdxInterno(alvo);
      }
      postar(alvo);
    },
    [controlado, onSlideChange, postar, total]
  );

  const baixar = useCallback(() => {
    const blob = new Blob([exportavel], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(titulo)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportavel, titulo]);

  // Abre a apresentação em uma aba nova (tela inteira com F, sem precisar baixar)
  const visualizar = useCallback(() => {
    const blob = new Blob([exportavel], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, [exportavel]);

  return (
    <div className="flex flex-col gap-3">
      {/* flex-wrap: no mobile os 3 botões descem pra linha de baixo do título */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-3">
        <h2 className="font-display text-xl">{titulo}</h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button type="button" onClick={visualizar}>
            VISUALIZAR
          </Button>
          {actions}
          <Button type="button" onClick={baixar}>
            DOWNLOAD
          </Button>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        srcDoc={ajustarHtmlParaEmbutir(html, navegavel ? { esconderContador: true, comPonte: true } : {})}
        onLoad={() => postar(indice)}
        title={`Preview: ${titulo}`}
        className="aspect-video w-full rounded-xl border border-fio18 bg-fundo [box-shadow:var(--sombra-card)]"
      />
      {navegavel ? (
        <div className="flex items-center justify-center gap-4 pt-1">
          <Button
            type="button"
            onClick={() => irPara(indice - 1)}
            disabled={indice <= 0}
            aria-label="Slide anterior"
          >
            ←
          </Button>
          <span className="min-w-16 text-center font-mono text-xs tracking-[0.12em] text-tinta3 tabular-nums">
            {indice + 1} / {total}
          </span>
          <Button
            type="button"
            onClick={() => irPara(indice + 1)}
            disabled={indice >= total - 1}
            aria-label="Próximo slide"
          >
            →
          </Button>
        </div>
      ) : null}
    </div>
  );
}
