"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandPicker } from "@/components/BrandPicker";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Field, inputClass } from "@/components/Field";
import { Toast } from "@/components/Toast";
import type { Marca, Modo, Visibilidade } from "@/lib/schema";

type Fase = "formulario" | "gerando";

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

const TAMANHOS: { value: 5 | 10 | 15 | 20 | "auto"; label: string }[] = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 15, label: "15" },
  { value: 20, label: "20+" },
  { value: "auto", label: "VOCÊ DECIDE" },
];

const VISIBILIDADES: { value: Visibilidade; label: string }[] = [
  { value: "publica", label: "PÚBLICA" },
  { value: "restrita", label: "RESTRITA" },
];

// Teto generoso pra não estourar o prompt da IA com um arquivo gigante.
const MAX_ARQUIVO_CARACTERES = 50_000;

export function GeneratorClient() {
  const router = useRouter();
  const [marca, setMarca] = useState<Marca>("group");
  const [modo, setModo] = useState<Modo>("dark");
  const [assunto, setAssunto] = useState("");
  const [numSlides, setNumSlides] = useState<5 | 10 | 15 | 20 | "auto">(10);
  const [conteudo, setConteudo] = useState("");
  const [visibilidade, setVisibilidade] = useState<Visibilidade>("publica");

  const [fase, setFase] = useState<Fase>("formulario");
  const [erro, setErro] = useState<string | null>(null);
  const [segundos, setSegundos] = useState(0);
  const arquivoRef = useRef<HTMLInputElement>(null);

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
    : !conteudo.trim()
      ? "Cole o conteúdo a cobrir"
      : null;

  // Lê um .txt/.md selecionado e joga o texto no campo de conteúdo — soma ao
  // que já tiver escrito em vez de apagar, pra não perder nada sem querer.
  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = ""; // permite escolher o mesmo arquivo de novo depois
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
      const texto = String(leitor.result ?? "").trim();
      if (!texto) {
        setErro("O arquivo está vazio.");
        return;
      }
      if (texto.length > MAX_ARQUIVO_CARACTERES) {
        setErro(
          `Arquivo muito grande (${texto.length.toLocaleString("pt-BR")} caracteres, máx. ${MAX_ARQUIVO_CARACTERES.toLocaleString("pt-BR")}). Cole só os trechos essenciais.`
        );
        return;
      }
      setConteudo((atual) => (atual.trim() ? `${atual.trim()}\n\n${texto}` : texto));
    };
    leitor.onerror = () => setErro("Não foi possível ler o arquivo. Tente novamente.");
    leitor.readAsText(arquivo);
  }

  async function gerar() {
    if (motivo) return;
    setErro(null);
    setFase("gerando");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marca,
          modo,
          assunto,
          numSlides,
          conteudo,
          visibilidade,
        }),
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
      setErro(body?.erro ?? "Erro ao gerar a apresentação. Seu briefing foi preservado — tente de novo.");
      setFase("formulario");
    } catch {
      setErro("A geração demorou demais ou a conexão caiu. Seu briefing foi preservado — tente de novo.");
      setFase("formulario");
    }
  }

  if (fase === "gerando") {
    return (
      <div className="surgir flex max-w-2xl flex-col gap-8 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta3"
        >
          ← APRESENTAÇÕES
        </Link>
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
    <div className="flex max-w-2xl flex-col gap-9">
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta3"
      >
        ← APRESENTAÇÕES
      </Link>
      <PageHeader
        titulo="Nova apresentação"
        descricao="Preencha o briefing e receba um HTML no padrão visual Ybera, pronto para apresentar."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          gerar();
        }}
        className="flex flex-col gap-9"
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

        <Field
          numero="04"
          label="NÚMERO DE SLIDES"
          hint="Aproximadamente — a IA ajusta o total final conforme o conteúdo."
        >
          <BrandPicker
            name="Número de slides"
            options={TAMANHOS}
            value={numSlides}
            onChange={setNumSlides}
          />
        </Field>

        <Field
          numero="05"
          label="CONTEÚDO"
          hint="Obrigatório. Cole os pontos, dados e fatos — nada será inventado. Sem números no briefing, não haverá slide de métricas."
        >
          <div className="flex justify-end">
            <input
              ref={arquivoRef}
              type="file"
              accept=".txt,.md,text/plain,text/markdown"
              className="hidden"
              onChange={handleArquivo}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => arquivoRef.current?.click()}
            >
              IMPORTAR .TXT
            </Button>
          </div>
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            rows={12}
            placeholder={"- Contexto do projeto\n- Dados e resultados (com números reais)\n- Próximos passos\n- Citações reais, se houver"}
            className={`${inputClass} resize-y font-mono text-sm leading-relaxed`}
          />
          {tamanhoConteudo > 0 ? (
            <p className="text-right font-mono text-[11px] tracking-[0.1em] text-tinta4">
              {tamanhoConteudo} CARACTERES
            </p>
          ) : null}
        </Field>

        <Field
          numero="06"
          label="VISIBILIDADE"
          hint="Pública: aparece pra toda a equipe. Restrita: só você vê. Dá para mudar depois."
        >
          <BrandPicker
            name="Visibilidade"
            options={VISIBILIDADES}
            value={visibilidade}
            onChange={setVisibilidade}
          />
        </Field>

        {/* pl acompanha a coluna numerada dos campos — que só existe no desktop */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 sm:pl-14">
          <Button type="submit" variant="primary" size="lg" disabled={Boolean(motivo)}>
            GERAR APRESENTAÇÃO
          </Button>
          {motivo ? <span className="text-sm text-tinta4">{motivo}</span> : null}
        </div>

        {erro ? <Toast message={erro} onClose={() => setErro(null)} /> : null}
      </form>
    </div>
  );
}
