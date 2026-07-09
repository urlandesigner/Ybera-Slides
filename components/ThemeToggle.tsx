"use client";

import { useEffect, useState } from "react";

type Tema = "dark" | "light";

// Alterna o tema do app (não o dos decks — cada apresentação tem seu próprio modo).
// O data-tema vive no <html>; um script inline no layout aplica antes da pintura.
export function ThemeToggle() {
  const [tema, setTema] = useState<Tema>("dark");

  useEffect(() => {
    setTema(document.documentElement.dataset.tema === "light" ? "light" : "dark");
  }, []);

  function aplicar(novo: Tema) {
    setTema(novo);
    document.documentElement.dataset.tema = novo;
    try {
      localStorage.setItem("tema", novo);
    } catch {
      // localStorage indisponível — o tema vale só para esta visita
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Tema da interface"
      className="flex items-center rounded-full border border-fio18"
    >
      {(["dark", "light"] as const).map((opcao) => (
        <button
          key={opcao}
          type="button"
          role="radio"
          aria-checked={tema === opcao}
          onClick={() => aplicar(opcao)}
          className={
            tema === opcao
              ? "rounded-full bg-tinta px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-fundo transition-colors"
              : "rounded-full px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta2"
          }
        >
          {opcao.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
