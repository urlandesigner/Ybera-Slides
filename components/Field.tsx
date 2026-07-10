// Campo de formulário no padrão editorial do índice Ybera:
// número em mono à esquerda, rótulo em caixa alta, hairline embaixo.
export function Field({
  numero,
  label,
  hint,
  children,
}: {
  numero?: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6 border-b border-fio pb-9">
      {/* A coluna numerada é assinatura editorial do desktop — em 375px ela
          come ~80px úteis do campo, então some no mobile. */}
      {numero ? (
        <span className="hidden w-8 shrink-0 pt-0.5 font-mono text-sm text-tinta4 sm:block" aria-hidden>
          {numero}
        </span>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <label className="font-mono text-xs tracking-[0.14em] text-tinta3">{label}</label>
        {children}
        {hint ? <p className="text-sm text-tinta4">{hint}</p> : null}
      </div>
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-fio18 bg-transparent px-4 py-3 text-base text-tinta placeholder:text-tinta4 transition-colors focus:border-fio25 focus:outline-none";
