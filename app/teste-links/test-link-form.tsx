"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { inputClass } from "@/components/Field";
import { Toast } from "@/components/Toast";

type Resultado = {
  email: string;
  link: string;
  redirectTo: string;
};

export function TestLinkForm() {
  const [email, setEmail] = useState("");
  const [key, setKey] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function gerar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setResultado(null);
    setToast(null);

    try {
      const res = await fetch("/api/auth/test-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, key }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setToast(body?.erro ?? "Não foi possível gerar o link.");
        return;
      }

      setResultado(body);
    } catch {
      setToast("Falha de rede ao gerar o link.");
    } finally {
      setCarregando(false);
    }
  }

  async function copiar() {
    if (!resultado?.link) return;

    try {
      await navigator.clipboard.writeText(resultado.link);
      setToast("Link copiado.");
    } catch {
      setToast("Não consegui copiar automaticamente.");
    }
  }

  return (
    <>
      <form onSubmit={gerar} className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <label htmlFor="admin-key" className="font-mono text-xs tracking-[0.14em] text-tinta3">
            CHAVE INTERNA
          </label>
          <input
            id="admin-key"
            type="password"
            required
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className={inputClass}
            placeholder="Cole a chave interna"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="email" className="font-mono text-xs tracking-[0.14em] text-tinta3">
            E-MAIL DO TESTER
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="voce@ybera.com"
          />
        </div>

        <Button type="submit" variant="primary" size="lg" disabled={carregando || !email || !key}>
          {carregando ? "GERANDO…" : "GERAR LINK DE TESTE"}
        </Button>
      </form>

      {resultado ? (
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-fio18 bg-painel/40 p-5">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs tracking-[0.14em] text-tinta3">LINK GERADO</p>
            <p className="text-sm text-tinta2">
              Envie este link manualmente para <span className="text-tinta">{resultado.email}</span>. Ele
              deve ser usado no navegador e tende a ser de uso unico.
            </p>
          </div>

          <textarea readOnly value={resultado.link} className={`${inputClass} min-h-32 resize-y text-sm`} />

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="primary" onClick={copiar}>
              COPIAR LINK
            </Button>
            <a
              href={resultado.link}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta2"
            >
              ABRIR LINK
            </a>
          </div>

          <p className="text-xs text-tinta4">Redirect configurado: {resultado.redirectTo}</p>
        </div>
      ) : null}

      {toast ? <Toast message={toast} tone="info" onClose={() => setToast(null)} /> : null}
    </>
  );
}
