"use client";

import { useState } from "react";
import { Toast } from "@/components/Toast";
import type { Visibilidade } from "@/lib/schema";

const OPCOES: { value: Visibilidade; label: string }[] = [
  { value: "publica", label: "PÚBLICA" },
  { value: "restrita", label: "RESTRITA" },
];

// Troca a visibilidade de um deck (só aparece para o dono).
export function VisibilityToggle({ deckId, inicial }: { deckId: string; inicial: Visibilidade }) {
  const [valor, setValor] = useState<Visibilidade>(inicial);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function mudar(novo: Visibilidade) {
    if (novo === valor || salvando) return;
    setSalvando(true);
    try {
      const res = await fetch(`/api/decks/${deckId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibilidade: novo }),
      });
      if (res.ok) {
        setValor(novo);
      } else {
        const body = await res.json().catch(() => null);
        setToast(body?.erro ?? "Não foi possível mudar a visibilidade");
      }
    } catch {
      setToast("Falha de rede ao mudar a visibilidade. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="font-mono text-xs tracking-[0.14em] text-tinta3">VISIBILIDADE</span>
      <div className="flex flex-wrap items-center gap-3">
        {/* Pílulas no mesmo padrão do BrandPicker (marca/modo) */}
        <div role="radiogroup" aria-label="Visibilidade" className="flex flex-wrap gap-2">
          {OPCOES.map((opt) => {
            const selecionada = valor === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selecionada}
                disabled={salvando}
                onClick={() => mudar(opt.value)}
                className={
                  selecionada
                    ? "rounded-full border border-fio25 bg-tinta px-5 py-2 font-mono text-xs tracking-[0.12em] text-fundo transition-colors disabled:opacity-50"
                    : "rounded-full border border-fio18 px-5 py-2 font-mono text-xs tracking-[0.12em] text-tinta3 transition-colors hover:border-fio25 hover:text-tinta2 disabled:opacity-50"
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <span className="text-xs text-tinta4">
          {valor === "publica" ? "Visível pra toda a equipe" : "Só você vê"}
        </span>
      </div>
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
