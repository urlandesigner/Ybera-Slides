"use client";

// Seletor de opções em linha (marca, modo, nº de slides) — pílulas com hairline.
// `cor` opcional exibe o ponto de acento da marca (vermelho Club, teal PRO).
export function BrandPicker<T extends string | number>({
  options,
  value,
  onChange,
  name,
}: {
  options: { value: T; label: string; cor?: string }[];
  value: T;
  onChange: (value: T) => void;
  name: string;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={
              selected
                ? "flex items-center gap-2.5 rounded-full border border-fio25 bg-tinta px-5 py-2 font-mono text-xs tracking-[0.12em] text-fundo transition-colors"
                : "flex items-center gap-2.5 rounded-full border border-fio18 px-5 py-2 font-mono text-xs tracking-[0.12em] text-tinta3 transition-colors hover:border-fio25 hover:text-tinta2"
            }
          >
            {opt.cor ? (
              <span
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{ background: opt.cor }}
              />
            ) : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
