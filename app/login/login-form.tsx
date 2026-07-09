"use client";

import { useState } from "react";
import { inputClass } from "@/components/Field";

type Status = "inicial" | "enviando" | "enviado";

export function LoginForm({ avisoInicial }: { avisoInicial: string | null }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("inicial");
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setStatus("enviando");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("enviado");
        return;
      }
      const body = await res.json().catch(() => null);
      setErro(body?.erro ?? "Não foi possível enviar o link. Tente de novo.");
      setStatus("inicial");
    } catch {
      setErro("Falha de rede. Verifique sua conexão e tente de novo.");
      setStatus("inicial");
    }
  }

  if (status === "enviado") {
    return (
      <div className="flex flex-col gap-3 border border-fio18 rounded-lg px-8 py-10">
        <h2 className="font-display text-xl">Verifique seu e-mail</h2>
        <p className="text-tinta3">
          Enviamos um link de acesso para <span className="text-tinta">{email}</span>. Abra o link
          neste navegador para entrar.
        </p>
        <button
          type="button"
          onClick={() => setStatus("inicial")}
          className="mt-2 self-start font-mono text-xs tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta3"
        >
          USAR OUTRO E-MAIL
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      {avisoInicial ? <p className="text-sm text-tinta3">{avisoInicial}</p> : null}
      <div className="flex flex-col gap-3">
        <label htmlFor="email" className="font-mono text-xs tracking-[0.14em] text-tinta3">
          E-MAIL CORPORATIVO
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          placeholder="voce@ybera.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>
      {erro ? (
        <p role="alert" className="text-sm text-erro">
          {erro}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "enviando" || !email}
        className="rounded-full border border-fio25 bg-tinta px-6 py-3 font-mono text-xs tracking-[0.12em] text-fundo transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "enviando" ? "ENVIANDO…" : "RECEBER LINK DE ACESSO"}
      </button>
    </form>
  );
}
