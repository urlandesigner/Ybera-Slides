"use client";

import { useCallback, useEffect, useRef } from "react";

function slugify(titulo: string): string {
  return (
    titulo
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "apresentacao"
  );
}

// Preview do deck em iframe isolado + ações. O HTML é auto-contido;
// allow-scripts é necessário para o visualizador (setas, escala, logos).
// slideAtivo (opcional) sincroniza o iframe com um slide específico — o HTML
// precisa conter o ouvinte de postMessage (o editor injeta isso no preview).
export function DeckPreview({
  html,
  htmlExport,
  titulo,
  actions,
  slideAtivo,
}: {
  html: string;
  htmlExport?: string; // HTML puro para baixar/visualizar (default: o mesmo do preview)
  titulo: string;
  actions?: React.ReactNode;
  slideAtivo?: number;
}) {
  const exportavel = htmlExport ?? html;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const irParaSlide = useCallback(() => {
    if (slideAtivo == null) return;
    iframeRef.current?.contentWindow?.postMessage({ tipo: "ir-para-slide", indice: slideAtivo }, "*");
  }, [slideAtivo]);

  // Ao trocar a seleção — e também quando o srcdoc recarrega após uma edição
  useEffect(irParaSlide, [irParaSlide, html]);
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
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl">{titulo}</h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={visualizar}
            className="rounded-full border border-fio18 px-5 py-2 font-mono text-xs tracking-[0.12em] text-tinta3 transition-colors hover:border-fio25 hover:text-tinta2"
          >
            VISUALIZAR
          </button>
          <button
            type="button"
            onClick={baixar}
            className="rounded-full border border-fio25 bg-tinta px-5 py-2 font-mono text-xs tracking-[0.12em] text-fundo transition-opacity hover:opacity-90"
          >
            BAIXAR HTML
          </button>
          {actions}
        </div>
      </div>
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        srcDoc={html}
        onLoad={irParaSlide}
        title={`Preview: ${titulo}`}
        className="aspect-video w-full rounded-lg border border-fio18 bg-fundo"
      />
      <p className="font-mono text-xs text-tinta4">
        NAVEGUE COM ← → OU CLIQUE · EM VISUALIZAR, F ENTRA EM TELA CHEIA
      </p>
    </div>
  );
}
