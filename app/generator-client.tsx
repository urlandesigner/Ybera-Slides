"use client";

import { useEffect, useState } from "react";
import { BrandPicker } from "@/components/BrandPicker";
import { DeckPreview } from "@/components/DeckPreview";
import { Field, inputClass } from "@/components/Field";
import { Toast } from "@/components/Toast";
import type { Marca, Modo } from "@/lib/schema";

type Fase = "formulario" | "gerando" | "pronto";

type Resultado = { id: string; titulo: string; html: string };

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

const TAMANHOS: { value: 10 | 14 | 18; label: string }[] = [
  { value: 10, label: "~10 SLIDES" },
  { value: 14, label: "~14 SLIDES" },
  { value: 18, label: "~18 SLIDES" },
];

const MINIMO_CONTEUDO = 40;

export function GeneratorClient() {
  const [marca, setMarca] = useState<Marca>("group");
  const [modo, setModo] = useState<Modo>("dark");
  const [assunto, setAssunto] = useState("");
  const [publico, setPublico] = useState("");
  const [numSlides, setNumSlides] = useState<10 | 14 | 18>(14);
  const [conteudo, setConteudo] = useState("");

  const [fase, setFase] = useState<Fase>("formulario");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(0);

  // Cronômetro honesto enquanto gera
  useEffect(() => {
    if (fase !== "gerando") return;
    setSegundos(0);
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [fase]);

  const tamanhoConteudo = conteudo.trim().length;

  // Motivo visível para o CTA desabilitado
  const motivo = !assunto.trim()
    ? "Preencha o assunto"
    : !publico.trim()
      ? "Preencha o público"
      : tamanhoConteudo < MINIMO_CONTEUDO
        ? "Cole o conteúdo a cobrir (pelo menos algumas linhas)"
        : null;

  async function gerar() {
    if (motivo) return;
    setErro(null);
    setFase("gerando");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marca, modo, assunto, publico, numSlides, conteudo }),
      });
      const body = await res.json().catch(() => null);
      if (res.ok && body?.html) {
        setResultado(body as Resultado);
        setFase("pronto");
        return;
      }
      if (res.status === 401) {
        window.location.href = "/login?erro=sessao";
        return;
      }
      setErro(body?.erro ?? "Erro ao gerar a apresentação. Seu briefing foi preservado — tente de novo.");
      setFase("formulario");
    } catch {
      setErro("A geração demorou demais ou a conexão caiu. Seu briefing foi preservado — tente de novo.");
      setFase("formulario");
    }
  }

  if (fase === "pronto" && resultado) {
    return (
      <div className="surgir">
        <DeckPreview
          html={resultado.html}
          titulo={resultado.titulo}
          actions={
            <>
              <a
                key="editar"
                href={`/deck/${resultado.id}/editar`}
                className="rounded-full border border-fio18 px-5 py-2 font-mono text-xs tracking-[0.12em] text-tinta3 transition-colors hover:border-fio25 hover:text-tinta2"
              >
                EDITAR
              </a>
              <button
                type="button"
                onClick={() => setFase("formulario")}
                className="rounded-full border border-fio18 px-5 py-2 font-mono text-xs tracking-[0.12em] text-tinta3 transition-colors hover:border-fio25 hover:text-tinta2"
              >
                NOVA VERSÃO
              </button>
            </>
          }
        />
      </div>
    );
  }

  if (fase === "gerando") {
    return (
      <div className="surgir flex max-w-2xl flex-col gap-8 py-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-full bg-tinta"
            style={{ animation: "pulsar 1.4s ease-in-out infinite" }}
          />
          <span className="font-mono text-xs tracking-[0.18em] text-tinta3">
            GERANDO APRESENTAÇÃO
          </span>
        </div>

        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Estruturando os slides do seu briefing…
        </h2>

        <div className="h-px overflow-hidden bg-fio" aria-hidden>
          <div
            className="h-full w-1/4 bg-tinta3"
            style={{ animation: "varrer 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite" }}
          />
        </div>

        <div className="flex flex-col gap-2 text-tinta3">
          <p>
            A IA organiza o conteúdo em seções e layouts do padrão Ybera; depois o servidor valida o
            contrato e monta o HTML final. Nada é inventado além do seu briefing.
          </p>
          <p className="text-sm text-tinta4">Costuma levar de 30 segundos a 2 minutos.</p>
        </div>

        <p className="font-mono text-xs tracking-[0.12em] text-tinta4">
          {String(Math.floor(segundos / 60)).padStart(2, "0")}:
          {String(segundos % 60).padStart(2, "0")} DECORRIDOS
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        gerar();
      }}
      className="flex max-w-2xl flex-col gap-9"
    >
      <Field numero="01" label="MARCA">
        <BrandPicker name="Marca" options={MARCAS} value={marca} onChange={setMarca} />
      </Field>

      <Field numero="02" label="MODO">
        <BrandPicker name="Modo" options={MODOS} value={modo} onChange={setModo} />
      </Field>

      <Field numero="03" label="ASSUNTO" hint="O tema central da apresentação.">
        <input
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          placeholder="Lançamento da linha PRO no varejo"
          className={inputClass}
        />
      </Field>

      <Field numero="04" label="PÚBLICO" hint="Para quem é: diretoria, franqueados, time comercial…">
        <input
          value={publico}
          onChange={(e) => setPublico(e.target.value)}
          placeholder="Diretoria e líderes de área"
          className={inputClass}
        />
      </Field>

      <Field numero="05" label="NÚMERO DE SLIDES">
        <BrandPicker
          name="Número de slides"
          options={TAMANHOS}
          value={numSlides}
          onChange={setNumSlides}
        />
      </Field>

      <Field
        numero="06"
        label="CONTEÚDO A COBRIR"
        hint="Cole os pontos, dados e fatos — nada será inventado. Sem números no briefing, não haverá slide de métricas."
      >
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          rows={12}
          placeholder={"- Contexto do projeto\n- Dados e resultados (com números reais)\n- Próximos passos\n- Citações reais, se houver"}
          className={`${inputClass} resize-y font-mono text-sm leading-relaxed`}
        />
        <p
          className={`text-right font-mono text-[11px] tracking-[0.1em] ${
            tamanhoConteudo === 0
              ? "text-tinta4"
              : tamanhoConteudo < MINIMO_CONTEUDO
                ? "text-erro"
                : "text-tinta4"
          }`}
        >
          {tamanhoConteudo} CARACTERES{tamanhoConteudo < MINIMO_CONTEUDO ? ` · MÍNIMO ${MINIMO_CONTEUDO}` : ""}
        </p>
      </Field>

      <div className="flex items-center gap-5 pl-14">
        <button
          type="submit"
          disabled={Boolean(motivo)}
          className="rounded-full border border-fio25 bg-tinta px-8 py-3 font-mono text-xs tracking-[0.12em] text-fundo transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          GERAR APRESENTAÇÃO
        </button>
        {motivo ? <span className="text-sm text-tinta4">{motivo}</span> : null}
      </div>

      {erro ? <Toast message={erro} onClose={() => setErro(null)} /> : null}
    </form>
  );
}
