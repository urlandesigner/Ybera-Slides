"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandPicker } from "@/components/BrandPicker";
import { Button } from "@/components/Button";
import { DeckPreview } from "@/components/DeckPreview";
import { Toast } from "@/components/Toast";
import { inputClass } from "@/components/Field";
import { VisibilityToggle } from "@/components/VisibilityToggle";
import {
  createBlankSlide,
  LAYOUTS_DISPONIVEIS,
  SLIDES_MAX,
  SLIDES_MIN,
  type LayoutDisponivel,
} from "@/lib/blank-slide";
import { rotuloDimensaoImagem, type LayoutComImagem } from "@/lib/image-slots";
import { renderDeck } from "@/lib/renderer";
import type { Deck, Marca, Modo, Slide, Visibilidade } from "@/lib/schema";

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
const selectClass = `${inputClass} text-sm appearance-none cursor-pointer`;

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

function CampoImagemUpload({
  layout,
  url,
  descricao,
  usarImagem,
  onPatch,
}: {
  layout: LayoutComImagem;
  url: string | null;
  descricao: string;
  usarImagem: boolean;
  onPatch: (patch: { imagemUrl?: string | null; usarImagem?: boolean }) => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inputId = useId();
  const dimensao = rotuloDimensaoImagem(layout);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setErro(null);
    setEnviando(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.url) {
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        setErro(json?.erro ?? "Não foi possível enviar a imagem");
        return;
      }
      // Um único patch — dois setState em sequência apagam a URL (stale slide).
      onPatch({ imagemUrl: json.url as string, usarImagem: true });
    } catch {
      setErro("Falha de rede ao enviar a imagem");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-fio18 bg-fundo/40 p-4">
      <label className="font-mono text-[10px] tracking-[0.14em] text-tinta4">IMAGEM DO SLIDE</label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onPatch({ usarImagem: true })}
          className={
            usarImagem
              ? "rounded-full border border-fio25 bg-tinta px-3.5 py-1.5 font-mono text-[11px] tracking-[0.1em] text-fundo"
              : "rounded-full border border-fio18 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.1em] text-tinta4 transition-colors hover:border-fio25 hover:text-tinta2"
          }
        >
          COM IMAGEM
        </button>
        <button
          type="button"
          onClick={() => onPatch({ usarImagem: false })}
          className={
            !usarImagem
              ? "rounded-full border border-fio25 bg-tinta px-3.5 py-1.5 font-mono text-[11px] tracking-[0.1em] text-fundo"
              : "rounded-full border border-fio18 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.1em] text-tinta4 transition-colors hover:border-fio25 hover:text-tinta2"
          }
        >
          SEM IMAGEM
        </button>
      </div>

      {!usarImagem ? (
        <p className="text-sm leading-snug text-tinta3">
          Este slide fica só com texto — sem foto e sem placeholder.
        </p>
      ) : (
        <>
          <p className="text-sm leading-snug text-tinta3">
            Tamanho ideal: <span className="font-mono text-tinta2">{dimensao}</span>
            {layout === "conteudo" ? " (coluna à direita)" : " (destaque full-bleed)"}. Outros
            tamanhos enchem o espaço com corte central.
          </p>
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={descricao || "Imagem do slide"}
              className="max-h-40 w-full rounded-md object-cover"
            />
          ) : (
            <div className="flex h-28 items-center justify-center rounded-md border border-dashed border-fio18">
              <span className="font-mono text-[10px] tracking-[0.12em] text-tinta4">
                SEM FOTO · PLACEHOLDER
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={inputId}
              className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-fio18 px-4 py-1.5 font-mono text-[11px] tracking-[0.12em] text-tinta3 transition-colors hover:border-fio25 hover:text-tinta2 ${
                enviando ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <svg aria-hidden viewBox="0 0 16 16" fill="none" className="size-3.5 shrink-0">
                <path
                  d="M3 11.5V13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1.5M8 10.5V3M5.5 5.5 8 3l2.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {enviando ? "ENVIANDO…" : url ? "SUBSTITUIR IMAGEM" : "SUBIR DO PC"}
            </label>
            <input
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              disabled={enviando}
              onChange={(e) => {
                void onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {url ? (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => onPatch({ imagemUrl: null })}
                disabled={enviando}
              >
                REMOVER FOTO
              </Button>
            ) : null}
          </div>
        </>
      )}
      {erro ? <p className="text-sm text-erro">{erro}</p> : null}
    </div>
  );
}

// Editor dos campos do slide. Estruturas fixas (métricas, timeline…) e
// quantidade de cards ajustável (1–5).
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

  function patchSlide(patch: Record<string, unknown>) {
    onChange({ ...structuredClone(registro), ...patch } as unknown as Slide);
  }

  function ajustarQtdCards(qtd: number) {
    if (slide.layout !== "cards") return;
    const atuais = structuredClone(slide.cards);
    while (atuais.length < qtd) {
      atuais.push({ titulo: `Card ${atuais.length + 1}`, texto: "Texto do card." });
    }
    while (atuais.length > qtd) atuais.pop();
    patchSlide({ cards: atuais });
  }

  const temSlotImagem = slide.layout === "conteudo" || slide.layout === "imagem";

  const campos: React.ReactNode[] = [];

  if (temSlotImagem) {
    campos.push(
      <CampoImagemUpload
        key="imagem-upload"
        layout={slide.layout}
        url={slide.imagemUrl ?? null}
        descricao={slide.imagemDescricao}
        usarImagem={slide.usarImagem !== false}
        onPatch={patchSlide}
      />
    );
  }

  if (slide.layout === "cards") {
    campos.push(
      <div key="qtd-cards" className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.14em] text-tinta4">QUANTIDADE DE CARDS</span>
        <div className="flex flex-wrap gap-2">
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => ajustarQtdCards(n)}
              className={
                slide.cards.length === n
                  ? "rounded-full border border-fio25 bg-tinta px-3.5 py-1.5 font-mono text-[11px] tracking-[0.1em] text-fundo"
                  : "rounded-full border border-fio18 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.1em] text-tinta4 transition-colors hover:border-fio25 hover:text-tinta2"
              }
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  for (const [chave, valor] of Object.entries(registro)) {
    if (chave === "layout" || chave === "imagemUrl" || chave === "usarImagem") continue;

    if (typeof valor === "string" || valor === null) {
      campos.push(
        <CampoTexto
          key={chave}
          rotulo={chave === "imagemDescricao" ? "descrição (placeholder)" : chave}
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

export function EditorClient({
  deckInicial,
  sourceId,
  visibilidadeInicial,
}: {
  deckInicial: Deck;
  sourceId: string;
  visibilidadeInicial: Visibilidade;
}) {
  const router = useRouter();
  const [deck, setDeck] = useState(deckInicial);
  const [idx, setIdx] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [confirmandoRemocaoSlide, setConfirmandoRemocaoSlide] = useState(false);
  const [incluindoAberto, setIncluindoAberto] = useState(false);
  const [layoutNovo, setLayoutNovo] = useState<LayoutDisponivel>("conteudo");
  // apósSlide: índice 0-based do slide após o qual inserir; -1 = no início
  const [aposSlide, setAposSlide] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const html = useMemo(() => renderDeck(deck), [deck]);

  const slide = deck.slides[idx];
  const total = deck.slides.length;
  const podeIncluir = total < SLIDES_MAX;
  const podeRemover = total > SLIDES_MIN;

  function atualizaSlide(novo: Slide) {
    setDeck((d) => ({ ...d, slides: d.slides.map((s, j) => (j === idx ? novo : s)) }));
  }

  function abrirIncluir() {
    setLayoutNovo("conteudo");
    setAposSlide(idx); // padrão: após o slide atual (ex.: entre 8 e 9 se o atual é o 8)
    setIncluindoAberto(true);
  }

  function incluirSlide() {
    if (!podeIncluir) {
      setToast(`Máximo de ${SLIDES_MAX} slides na apresentação`);
      return;
    }
    const novo = createBlankSlide(layoutNovo);
    const insertAt = aposSlide + 1; // -1+1=0 (início); 7+1=8 (entre 8 e 9)
    setDeck((d) => {
      const slides = [...d.slides];
      slides.splice(insertAt, 0, novo);
      return { ...d, slides };
    });
    setIdx(insertAt);
    setIncluindoAberto(false);
    setConfirmandoRemocaoSlide(false);
  }

  function removerSlide() {
    if (!podeRemover) {
      setToast(`Mínimo de ${SLIDES_MIN} slides na apresentação`);
      return;
    }
    if (!confirmandoRemocaoSlide) {
      setConfirmandoRemocaoSlide(true);
      setTimeout(() => setConfirmandoRemocaoSlide(false), 4000);
      return;
    }
    setDeck((d) => ({
      ...d,
      slides: d.slides.filter((_, j) => j !== idx),
    }));
    setIdx((i) => Math.min(i, total - 2));
    setConfirmandoRemocaoSlide(false);
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
        window.location.href = "/login";
        return;
      }
      setToast(body?.erro ?? "Não foi possível salvar as alterações");
    } catch {
      setToast("Falha de rede ao salvar. Suas edições continuam nesta tela — tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    // Primeiro clique só arma a confirmação — desarma sozinha em 4s.
    if (!confirmandoExclusao) {
      setConfirmandoExclusao(true);
      setTimeout(() => setConfirmandoExclusao(false), 4000);
      return;
    }
    setExcluindo(true);
    try {
      const res = await fetch(`/api/decks/${sourceId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/?filtro=minhas");
        return;
      }
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      const body = await res.json().catch(() => null);
      setToast(body?.erro ?? "Não foi possível excluir a apresentação");
      setConfirmandoExclusao(false);
    } catch {
      setToast("Falha de rede ao excluir. Tente de novo.");
      setConfirmandoExclusao(false);
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[400px_1fr]">
      <div className="flex flex-col gap-8 rounded-xl border border-fio-card bg-painel px-6 py-8 sm:px-8">
        {/* Cada etapa (título, marca, modo, visibilidade) com rótulo próprio
            e respiro entre grupos — mesmo padrão do formulário de geração. */}
        <div className="flex flex-col gap-7 border-b border-fio pb-8">
          <div className="flex flex-col gap-3">
            <label className="font-mono text-xs tracking-[0.14em] text-tinta3">
              TÍTULO DA APRESENTAÇÃO
            </label>
            <input
              value={deck.titulo}
              onChange={(e) => setDeck((d) => ({ ...d, titulo: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs tracking-[0.14em] text-tinta3">MARCA</span>
            <BrandPicker
              name="Marca"
              options={MARCAS}
              value={deck.marca}
              onChange={(marca) => setDeck((d) => ({ ...d, marca }))}
            />
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-xs tracking-[0.14em] text-tinta3">MODO</span>
            <BrandPicker
              name="Modo"
              options={MODOS}
              value={deck.modo}
              onChange={(modo) => setDeck((d) => ({ ...d, modo }))}
            />
          </div>
          <VisibilityToggle deckId={sourceId} inicial={visibilidadeInicial} />
        </div>

        <div className="flex flex-col gap-3">
          <label className="font-mono text-xs tracking-[0.14em] text-tinta3">SLIDES</label>
          <div className="flex flex-wrap gap-2">
            {deck.slides.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setIdx(i);
                  setConfirmandoRemocaoSlide(false);
                }}
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

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={abrirIncluir}
              disabled={!podeIncluir || salvando}
              className="gap-2"
            >
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                fill="none"
                className="size-3.5 shrink-0"
              >
                <path
                  d="M8 3.5v9M3.5 8h9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              INCLUIR SLIDE
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={removerSlide}
              disabled={!podeRemover || salvando}
              className="gap-2"
            >
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                fill="none"
                className="size-3.5 shrink-0"
              >
                <path
                  d="M3.5 5.5h9M6.5 5.5V4h3v1.5M5.5 5.5l.5 7h4l.5-7"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {confirmandoRemocaoSlide
                ? "CLIQUE DE NOVO PRA REMOVER"
                : `REMOVER SLIDE ${String(idx + 1).padStart(2, "0")}`}
            </Button>
          </div>

          {incluindoAberto ? (
            <div className="flex flex-col gap-4 rounded-lg border border-fio18 bg-fundo/40 p-4">
              <p className="font-mono text-[10px] tracking-[0.14em] text-tinta4">
                NOVO SLIDE · POSIÇÃO E LAYOUT
              </p>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] tracking-[0.14em] text-tinta4">
                  LAYOUT
                </label>
                <select
                  value={layoutNovo}
                  onChange={(e) => setLayoutNovo(e.target.value as LayoutDisponivel)}
                  className={selectClass}
                >
                  {LAYOUTS_DISPONIVEIS.map((l) => (
                    <option key={l} value={l}>
                      {l.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] tracking-[0.14em] text-tinta4">
                  INSERIR APÓS
                </label>
                <select
                  value={aposSlide}
                  onChange={(e) => setAposSlide(Number(e.target.value))}
                  className={selectClass}
                >
                  <option value={-1}>INÍCIO (ANTES DO SLIDE 01)</option>
                  {deck.slides.map((s, i) => (
                    <option key={i} value={i}>
                      SLIDE {String(i + 1).padStart(2, "0")} · {s.layout.toUpperCase()}
                      {i < total - 1
                        ? ` → FICA ENTRE ${String(i + 1).padStart(2, "0")} E ${String(i + 2).padStart(2, "0")}`
                        : " → FIM"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="primary" size="sm" onClick={incluirSlide}>
                  CONFIRMAR INCLUSÃO
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIncluindoAberto(false)}
                >
                  CANCELAR
                </Button>
              </div>
            </div>
          ) : null}

          {!podeIncluir ? (
            <p className="text-sm text-tinta4">Limite de {SLIDES_MAX} slides atingido.</p>
          ) : null}
          {!podeRemover ? (
            <p className="text-sm text-tinta4">Mínimo de {SLIDES_MIN} slides — não dá pra remover mais.</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-4 border-t border-fio pt-6">
          <p className="font-mono text-xs tracking-[0.12em] text-tinta4">
            SLIDE {String(idx + 1).padStart(2, "0")} · {slide.layout.toUpperCase()}
          </p>
          <CamposDoSlide slide={slide} onChange={atualizaSlide} />
        </div>

        <Button type="button" variant="primary" size="lg" onClick={salvar} disabled={salvando}>
          {salvando ? "SALVANDO…" : "SALVAR ALTERAÇÕES"}
        </Button>
        <p className="text-sm text-tinta4">As alterações serão aplicadas nesta apresentação.</p>

        <div className="flex flex-col gap-3 border-t border-fio pt-6">
          <Button type="button" variant="danger" size="lg" onClick={excluir} disabled={excluindo || salvando}>
            {excluindo
              ? "EXCLUINDO…"
              : confirmandoExclusao
                ? "CLIQUE DE NOVO PRA EXCLUIR"
                : "EXCLUIR APRESENTAÇÃO"}
          </Button>
          <p className="text-sm text-tinta4">A apresentação sai do site pra todo mundo.</p>
        </div>
      </div>

      <div className="min-w-0 lg:sticky lg:top-8 lg:self-start">
        {/* Modo controlado: as setas abaixo do deck e a lista de slides do
            painel mexem no mesmo índice (idx) — sempre em sincronia. */}
        <DeckPreview
          html={html}
          titulo={deck.titulo}
          navegavel
          slideAtivo={idx}
          onSlideChange={setIdx}
        />
      </div>

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
