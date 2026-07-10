import { Button } from "@/components/Button";

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
    <div className="flex flex-col items-start gap-4 rounded-xl border border-fio18 bg-painel px-5 py-10 [box-shadow:var(--sombra-card)] sm:px-8 sm:py-12">
      <h2 className="font-display text-2xl">{titulo}</h2>
      <p className="max-w-md text-tinta3">{texto}</p>
      <Button href={href} variant="primary" className="mt-2">
        {cta.toUpperCase()}
      </Button>
    </div>
  );
}
