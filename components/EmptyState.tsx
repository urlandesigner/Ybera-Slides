import Link from "next/link";

export function EmptyState({
  titulo,
  texto,
  cta,
  href,
}: {
  titulo: string;
  texto: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="flex flex-col items-start gap-4 border border-fio18 rounded-lg px-8 py-12">
      <h2 className="font-display text-2xl">{titulo}</h2>
      <p className="max-w-md text-tinta3">{texto}</p>
      <Link
        href={href}
        className="mt-2 rounded-full border border-fio25 bg-tinta px-6 py-2.5 font-mono text-xs tracking-[0.12em] text-fundo transition-opacity hover:opacity-90"
      >
        {cta.toUpperCase()}
      </Link>
    </div>
  );
}
