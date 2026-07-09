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
    <div className="flex items-center gap-3">
      <span className="font-mono text-[10px] tracking-[0.14em] text-tinta4">VISIBILIDADE</span>
      <div role="radiogroup" aria-label="Visibilidade" className="flex items-center rounded-full border border-fio18">
        {OPCOES.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={valor === opt.value}
            disabled={salvando}
            onClick={() => mudar(opt.value)}
            className={
              valor === opt.value
                ? "rounded-full bg-tinta px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-fundo transition-colors"
                : "rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta2 disabled:opacity-50"
            }
          >
            {opt.label}
          </button>
        ))}
      </div>
      <span className="text-xs text-tinta4">
        {valor === "publica" ? "Visível no repositório da equipe" : "Só você vê"}
      </span>
      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
