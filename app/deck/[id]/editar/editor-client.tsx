"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandPicker } from "@/components/BrandPicker";
import { DeckPreview } from "@/components/DeckPreview";
import { Toast } from "@/components/Toast";
import { inputClass } from "@/components/Field";
import { renderDeck } from "@/lib/renderer";
import type { Deck, Marca, Modo, Slide } from "@/lib/schema";

// Campos que aceitam "vazio = ausente" no contrato
const CAMPOS_ANULAVEIS = new Set(["apoio", "contexto"]);

const MARCAS: { value: Marca; label: string; cor: string }[] = [
  { value: "group", label: "GRUPO", cor: "var(--color-marca-group)" },
  { value: "ybera", label: "YBERA", cor: "var(--color-marca-ybera)" },
  { value: "club", label: "CLUB", cor: "var(--color-marca-club)" },
  { value: "pro", label: "PRO", cor: "var(--color-marca-pro)" },
];

const MODOS: { value: Modo; label: string }[] = [
  { value: "dark", label: "DARK" },
  { value: "light", label: "LIGHT" },
];

const areaClass = `${inputClass} resize-y text-sm leading-relaxed`;

function CampoTexto({
  rotulo,
  valor,
  anulavel,
  onChange,
}: {
  rotulo: string;
  valor: string;
  anulavel: boolean;
  onChange: (v: string | null) => void;
}) {
  const longo = valor.length > 48;
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] tracking-[0.14em] text-tinta4">
        {rotulo.toUpperCase()}
        {anulavel ? " (OPCIONAL)" : ""}
      </label>
      {longo ? (
        <textarea
          value={valor}
          rows={3}
          onChange={(e) => onChange(anulavel && e.target.value === "" ? null : e.target.value)}
          className={areaClass}
        />
      ) : (
        <input
          value={valor}
          onChange={(e) => onChange(anulavel && e.target.value === "" ? null : e.target.value)}
          className={`${inputClass} text-sm`}
        />
      )}
    </div>
  );
}

// Editor genérico dos textos de um slide. A estrutura (layouts, quantidade de
// itens) é fixa — só os textos mudam, então a edição nunca quebra o contrato.
function CamposDoSlide({ slide, onChange }: { slide: Slide; onChange: (s: Slide) => void }) {
  const registro = slide as unknown as Record<string, unknown>;

  function setCampo(caminho: (string | number)[], valor: unknown) {
    const novo = structuredClone(registro);
    let alvo: unknown = novo;
    for (const chave of caminho.slice(0, -1)) {
      alvo = (alvo as Record<string | number, unknown>)[chave];
    }
    (alvo as Record<string | number, unknown>)[caminho[caminho.length - 1]] = valor;
    onChange(novo as unknown as Slide);
  }

  const campos: React.ReactNode[] = [];
  for (const [chave, valor] of Object.entries(registro)) {
    if (chave === "layout") continue;

    if (typeof valor === "string" || valor === null) {
      campos.push(
        <CampoTexto
          key={chave}
          rotulo={chave}
          valor={valor ?? ""}
          anulavel={CAMPOS_ANULAVEIS.has(chave)}
          onChange={(v) => setCampo([chave], v)}
        />
      );
      continue;
    }

    if (Array.isArray(valor)) {
      valor.forEach((item, i) => {
        if (typeof item === "string") {
          campos.push(
            <CampoTexto
              key={`${chave}-${i}`}
              rotulo={`${chave} ${i + 1}`}
              valor={item}
              anulavel={false}
              onChange={(v) => setCampo([chave, i], v ?? "")}
            />
          );
          return;
        }
        for (const [sub, subValor] of Object.entries(item as Record<string, unknown>)) {
          if (typeof subValor !== "string" && subValor !== null) continue;
          campos.push(
            <CampoTexto
              key={`${chave}-${i}-${sub}`}
              rotulo={`${chave} ${i + 1} · ${sub}`}
              valor={(subValor as string | null) ?? ""}
              anulavel={CAMPOS_ANULAVEIS.has(sub)}
              onChange={(v) => setCampo([chave, i, sub], CAMPOS_ANULAVEIS.has(sub) ? v : (v ?? ""))}
            />
          );
        }
      });
    }
  }

  return <div className="flex flex-col gap-4">{campos}</div>;
}

export function EditorClient({ deckInicial, sourceId }: { deckInicial: Deck; sourceId: string }) {
  const router = useRouter();
  const [deck, setDeck] = useState(deckInicial);
  const [idx, setIdx] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const html = useMemo(() => renderDeck(deck), [deck]);

  // Só no preview do editor: ouvinte que deixa o painel controlar qual slide
  // o visualizador exibe (o HTML salvo/baixado é re-renderizado sem isto).
  const htmlPreview = useMemo(
    () =>
      html.replace(
        "</body>",
        `<script>window.addEventListener("message",function(e){if(e.data&&e.data.tipo==="ir-para-slide"&&typeof mostrar==="function"){mostrar(e.data.indice);}});</script>\n</body>`
      ),
    [html]
  );

  const slide = deck.slides[idx];

  function atualizaSlide(novo: Slide) {
    setDeck((d) => ({ ...d, slides: d.slides.map((s, j) => (j === idx ? novo : s)) }));
  }

  async function salvar() {
    setSalvando(true);
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId, deck }),
      });
      const body = await res.json().catch(() => null);
      if (res.ok && body?.id) {
        router.push(`/deck/${body.id}`);
        return;
      }
      if (res.status === 401) {
        window.location.href = "/login?erro=sessao";
        return;
      }
      setToast(body?.erro ?? "Não foi possível salvar a nova versão");
    } catch {
      setToast("Falha de rede ao salvar. Suas edições continuam nesta tela — tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[400px_1fr]">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 border-b border-fio pb-8">
          <label className="font-mono text-xs tracking-[0.14em] text-tinta3">TÍTULO DA APRESENTAÇÃO</label>
          <input
            value={deck.titulo}
            onChange={(e) => setDeck((d) => ({ ...d, titulo: e.target.value }))}
            className={inputClass}
          />
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <BrandPicker
              name="Marca"
              options={MARCAS}
              value={deck.marca}
              onChange={(marca) => setDeck((d) => ({ ...d, marca }))}
            />
            <BrandPicker
              name="Modo"
              options={MODOS}
              value={deck.modo}
              onChange={(modo) => setDeck((d) => ({ ...d, modo }))}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="font-mono text-xs tracking-[0.14em] text-tinta3">SLIDES</label>
          <div className="flex flex-wrap gap-2">
            {deck.slides.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={
                  i === idx
                    ? "rounded-full border border-fio25 bg-tinta px-3.5 py-1.5 font-mono text-[11px] tracking-[0.1em] text-fundo transition-colors"
                    : "rounded-full border border-fio18 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.1em] text-tinta4 transition-colors hover:border-fio25 hover:text-tinta2"
                }
              >
                {String(i + 1).padStart(2, "0")} {s.layout.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-fio pt-6">
          <p className="font-mono text-xs tracking-[0.12em] text-tinta4">
            SLIDE {String(idx + 1).padStart(2, "0")} · {slide.layout.toUpperCase()}
          </p>
          <CamposDoSlide slide={slide} onChange={atualizaSlide} />
        </div>

        <button
          type="button"
          onClick={salvar}
          disabled={salvando}
          className="rounded-full border border-fio25 bg-tinta px-8 py-3 font-mono text-xs tracking-[0.12em] text-fundo disabled:cursor-not-allowed disabled:opacity-40"
        >
          {salvando ? "SALVANDO…" : "SALVAR NOVA VERSÃO"}
        </button>
        <p className="text-sm text-tinta4">
          Salvar cria uma nova apresentação no histórico — a original permanece intacta. Edições não
          consomem sua cota diária de geração.
        </p>
      </div>

      <div className="min-w-0 lg:sticky lg:top-8 lg:self-start">
        <DeckPreview html={htmlPreview} htmlExport={html} titulo={deck.titulo} slideAtivo={idx} />
      </div>

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
