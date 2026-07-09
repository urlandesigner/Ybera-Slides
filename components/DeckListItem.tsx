import Link from "next/link";

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
  autorEmail,
  createdAt,
  visibilidade,
}: {
  id: string;
  titulo: string;
  marca: string;
  autorEmail: string;
  createdAt: string;
  visibilidade?: string; // quando presente, mostra o selo (tela Minhas)
}) {
  const info = MARCAS[marca] ?? { rotulo: marca.toUpperCase(), cor: "var(--color-tinta4)" };
  const dt = new Date(createdAt);
  const data = dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
  const hora = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <Link
      href={`/deck/${id}`}
      className="-mx-4 flex items-baseline justify-between gap-6 rounded-lg border-b border-fio px-4 py-5 transition-colors hover:bg-painel"
    >
      <div className="flex min-w-0 items-baseline gap-4">
        <span className="flex shrink-0 items-center gap-2 rounded-full border border-fio18 px-3 py-1 font-mono text-[11px] tracking-[0.12em] text-tinta3">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: info.cor }} />
          {info.rotulo}
        </span>
        <span className="truncate font-display text-base text-tinta">{titulo}</span>
        {visibilidade === "restrita" ? (
          <span className="flex shrink-0 items-center gap-2 rounded-full border border-fio18 px-3 py-1 font-mono text-[11px] tracking-[0.12em] text-tinta4">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full border border-fio25" />
            RESTRITA
          </span>
        ) : null}
      </div>
      <div className="flex shrink-0 items-baseline gap-6 font-mono text-xs text-tinta4">
        <span className="hidden sm:inline">{autorEmail}</span>
        <span>
          {data} · {hora}
        </span>
      </div>
    </Link>
  );
}
