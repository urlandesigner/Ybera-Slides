import Link from "next/link";
import { ajustarHtmlParaEmbutir } from "@/lib/deck-embed";

const MARCAS: Record<string, { rotulo: string; cor: string }> = {
  group: { rotulo: "GRUPO", cor: "var(--color-marca-group)" },
  ybera: { rotulo: "YBERA", cor: "var(--color-marca-ybera)" },
  club: { rotulo: "CLUB", cor: "var(--color-marca-club)" },
  pro: { rotulo: "PRO", cor: "var(--color-marca-pro)" },
};

export function DeckListItem({
  id,
  titulo,
  marca,
  html,
  autorEmail,
  createdAt,
  visibilidade,
  mostrarAutor = true,
}: {
  id: string;
  titulo: string;
  marca: string;
  html: string;
  autorEmail: string;
  createdAt: string;
  visibilidade?: string; // quando presente, mostra o selo (filtro Minhas)
  mostrarAutor?: boolean; // false no filtro Minhas — autor é sempre o próprio usuário
}) {
  const info = MARCAS[marca] ?? { rotulo: marca.toUpperCase(), cor: "var(--color-tinta4)" };
  const data = new Date(createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return (
    <Link
      href={`/deck/${id}`}
      className="card-sombra flex flex-col overflow-hidden rounded-xl border border-fio18 bg-painel hover:border-fio25"
    >
      {/* A capa é sempre o primeiro slide — o próprio HTML do deck se auto-escala pro tamanho do iframe. */}
      <iframe
        srcDoc={ajustarHtmlParaEmbutir(html, { esconderContador: true })}
        sandbox="allow-scripts"
        tabIndex={-1}
        aria-hidden="true"
        title={`Capa de ${titulo}`}
        className="aspect-video w-full border-b border-fio18 bg-fundo pointer-events-none"
      />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex shrink-0 items-center gap-2 rounded-full border border-fio18 px-3 py-1 font-mono text-[11px] tracking-[0.12em] text-tinta3">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: info.cor }} />
            {info.rotulo}
          </span>
          {visibilidade === "restrita" ? (
            <span className="flex shrink-0 items-center gap-2 rounded-full border border-fio18 px-3 py-1 font-mono text-[11px] tracking-[0.12em] text-tinta4">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full border border-fio25" />
              RESTRITA
            </span>
          ) : null}
        </div>
        <span className="truncate font-display text-base text-tinta">{titulo}</span>
        <div className="flex items-center gap-3 font-mono text-xs text-tinta3">
          {mostrarAutor ? <span className="truncate">{autorEmail}</span> : null}
          <span className="shrink-0">{data}</span>
        </div>
      </div>
    </Link>
  );
}
