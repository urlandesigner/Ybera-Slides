import Link from "next/link";
import type { ComponentProps } from "react";

const VARIANTS = {
  primary: "border border-fio25 bg-tinta text-fundo hover:opacity-90",
  secondary: "border border-fio18 text-tinta3 hover:border-fio25 hover:text-tinta2",
  danger: "border border-erro/50 text-erro hover:border-erro",
} as const;

const SIZES = {
  sm: "px-4 py-1.5 text-[11px]",
  md: "px-5 py-2 text-xs",
  lg: "px-8 py-3 text-xs",
} as const;

const BASE =
  "inline-flex items-center justify-center rounded-full font-mono tracking-[0.12em] transition-colors disabled:cursor-not-allowed disabled:opacity-40";

type Variant = keyof typeof VARIANTS;
type Size = keyof typeof SIZES;

type ButtonOwnProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

type LinkButtonProps = ButtonOwnProps &
  Omit<ComponentProps<typeof Link>, "className"> & { href: string };

type NativeButtonProps = ButtonOwnProps &
  Omit<ComponentProps<"button">, "className"> & { href?: undefined };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

// Botão pill único pro app inteiro: mesma altura/tipografia em toda ação
// primária ou secundária, seja link de navegação ou botão de formulário.
export function Button({ variant = "secondary", size = "md", className = "", ...props }: ButtonProps) {
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (props.href !== undefined) {
    const { href, ...rest } = props;
    return <Link href={href} className={classes} {...rest} />;
  }

  const { type = "button", ...rest } = props;
  return <button type={type} className={classes} {...rest} />;
}
