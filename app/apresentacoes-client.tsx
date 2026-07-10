"use client";

import { useState } from "react";
import { PageHeader } from "@/components/AppShell";
import { DeckListItem } from "@/components/DeckListItem";
import { EmptyState } from "@/components/EmptyState";
import type { DeckResumo, Filtro } from "@/lib/decks-lista";

const TEXTOS: Record<Filtro, { descricao: string; vazioTitulo: string; vazioTexto: string; cta: string }> = {
  publicas: {
    descricao: "Apresentações públicas do Grupo Ybera.",
    vazioTitulo: "Nenhuma apresentação pública ainda",
    vazioTexto: "Quando alguém da equipe gerar uma apresentação pública, ela aparece aqui para todos.",
    cta: "Criar a primeira",
  },
  minhas: {
    descricao: "Tudo o que você gerou ou editou, inclusive as restritas.",
    vazioTitulo: "Você ainda não gerou nenhuma apresentação",
    vazioTexto: "Preencha um briefing e sua primeira apresentação aparece aqui.",
    cta: "Criar agora",
  },
};

// Abas de verdade: cada lista é buscada uma vez e fica em memória — trocar de
// aba depois disso é instantâneo, sem nova ida ao servidor nem navegação de
// página inteira (a rota GET /api/decks é a mesma consulta que o SSR inicial
// já faz, só sob demanda).
export function ApresentacoesClient({
  filtroInicial,
  decksIniciais,
  erroInicial,
}: {
  filtroInicial: Filtro;
  decksIniciais: DeckResumo[] | null;
  erroInicial: boolean;
}) {
  const [filtro, setFiltro] = useState<Filtro>(filtroInicial);
  const [cache, setCache] = useState<Partial<Record<Filtro, DeckResumo[]>>>(
    erroInicial ? {} : { [filtroInicial]: decksIniciais ?? [] }
  );
  const [carregando, setCarregando] = useState<Filtro | null>(null);
  const [erro, setErro] = useState(erroInicial);

  async function selecionar(alvo: Filtro) {
    setFiltro(alvo);
    window.history.replaceState(null, "", alvo === "publicas" ? "/" : "/?filtro=minhas");
    if (cache[alvo] || carregando === alvo) return;

    setCarregando(alvo);
    setErro(false);
    try {
      const res = await fetch(`/api/decks?filtro=${alvo}`);
      if (!res.ok) throw new Error();
      const body = await res.json();
      setCache((c) => ({ ...c, [alvo]: body.decks }));
    } catch {
      setErro(true);
    } finally {
      setCarregando(null);
    }
  }

  const decks = cache[filtro];
  const texto = TEXTOS[filtro];

  return (
    <>
      <PageHeader titulo="Apresentações" descricao={texto.descricao} />

      <div className="mb-8 flex w-fit items-center rounded-full border border-fio18">
        {(["publicas", "minhas"] as const).map((valor) => (
          <button
            key={valor}
            type="button"
            onClick={() => selecionar(valor)}
            aria-current={filtro === valor ? "true" : undefined}
            className={
              filtro === valor
                ? "rounded-full bg-tinta px-4 py-1.5 font-mono text-[11px] tracking-[0.12em] text-fundo"
                : "rounded-full px-4 py-1.5 font-mono text-[11px] tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta2"
            }
          >
            {valor === "publicas" ? "PÚBLICAS" : "MINHAS"}
          </button>
        ))}
      </div>

      {erro ? (
        <p className="text-sm text-erro">Não foi possível carregar as apresentações. Recarregue a página.</p>
      ) : carregando === filtro && !decks ? (
        <p className="text-sm text-tinta4">Carregando…</p>
      ) : !decks || decks.length === 0 ? (
        <EmptyState titulo={texto.vazioTitulo} texto={texto.vazioTexto} cta={texto.cta} href="/nova" />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((d) => (
            <DeckListItem
              key={d.id}
              id={d.id}
              titulo={d.titulo}
              marca={d.marca}
              html={d.capa}
              autorEmail={d.autorEmail}
              createdAt={d.createdAt}
              visibilidade={filtro === "minhas" ? d.visibilidade : undefined}
              mostrarAutor={filtro !== "minhas"}
            />
          ))}
        </div>
      )}
    </>
  );
}
