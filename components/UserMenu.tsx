"use client";

import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

// Sem cadastro de nome no app (login é só por magic link) — deriva um nome
// de exibição a partir do e-mail: "urlan.dipre@ybera.com" → "Urlan Dipre".
function nomeDoEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const partes = local.split(/[._]+/).filter(Boolean);
  if (partes.length === 0) return email;
  return partes.map((p) => p[0].toUpperCase() + p.slice(1).toLowerCase()).join(" ");
}

export function UserMenu({ email }: { email: string }) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const nome = nomeDoEmail(email);
  const inicial = nome[0]?.toUpperCase() ?? "?";

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    function aoApertarTecla(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }

    document.addEventListener("mousedown", aoClicarFora);
    document.addEventListener("keydown", aoApertarTecla);
    return () => {
      document.removeEventListener("mousedown", aoClicarFora);
      document.removeEventListener("keydown", aoApertarTecla);
    };
  }, [aberto]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={`Menu de ${nome}`}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-fio18 bg-painel font-mono text-xs font-semibold text-tinta transition-colors hover:border-fio25"
      >
        {inicial}
      </button>

      {aberto ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-10 mt-2 w-64 max-w-[calc(100vw-3rem)] rounded-lg border border-fio18 bg-painel p-4 shadow-lg"
        >
          <p className="truncate font-display text-base text-tinta">{nome}</p>
          <p className="mt-0.5 truncate font-mono text-xs text-tinta3">{email}</p>

          <div className="my-4 border-t border-fio" />

          <ThemeToggle />

          <div className="my-4 border-t border-fio" />

          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              role="menuitem"
              className="font-mono text-xs tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta2"
            >
              SAIR
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
