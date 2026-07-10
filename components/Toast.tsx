"use client";

import { useEffect } from "react";

// Aviso discreto no rodapé da tela. Some sozinho após alguns segundos.
export function Toast({
  message,
  tone = "erro",
  onClose,
}: {
  message: string;
  tone?: "erro" | "info";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      role="status"
      className={`surgir fixed bottom-6 left-1/2 z-50 flex w-max max-w-[calc(100vw-2.5rem)] -translate-x-1/2 items-center gap-3 rounded-lg border bg-painel px-5 py-3 text-sm [box-shadow:var(--sombra-card)] ${
        tone === "erro" ? "border-erro/50 text-tinta" : "border-fio25 text-tinta2"
      }`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone === "erro" ? "bg-erro" : "bg-tinta3"}`}
      />
      {message}
    </div>
  );
}
