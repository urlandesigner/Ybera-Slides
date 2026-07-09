import Link from "next/link";
import { LogoYbera } from "@/components/LogoYbera";
import { ThemeToggle } from "@/components/ThemeToggle";

function NavLink({ href, ativo, children }: { href: string; ativo: boolean; children: string }) {
  return (
    <Link
      href={href}
      aria-current={ativo ? "page" : undefined}
      className={
        ativo
          ? "flex items-center gap-2 text-tinta"
          : "flex items-center gap-2 text-tinta4 transition-colors hover:text-tinta2"
      }
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full transition-colors ${ativo ? "bg-tinta" : "bg-transparent"}`}
      />
      {children}
    </Link>
  );
}

// Casca do app: cabeçalho operacional com navegação, e-mail e saída. Sem hero, sem sombras.
export function AppShell({
  email,
  active,
  children,
}: {
  email: string;
  active: "nova" | "historico";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-fio">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-3 text-tinta">
              <LogoYbera className="h-6 w-auto" />
              <span className="hidden font-mono text-[10px] tracking-[0.18em] text-tinta4 sm:inline">
                GERADOR DE APRESENTAÇÕES
              </span>
            </Link>
            <nav className="flex items-baseline gap-6 font-mono text-xs tracking-[0.12em]">
              <NavLink href="/" ativo={active === "nova"}>
                NOVA
              </NavLink>
              <NavLink href="/historico" ativo={active === "historico"}>
                HISTÓRICO
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-5">
            <ThemeToggle />
            <span className="hidden font-mono text-xs text-tinta4 md:inline">{email}</span>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="font-mono text-xs tracking-[0.12em] text-tinta4 transition-colors hover:text-tinta2"
              >
                SAIR
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="surgir mx-auto max-w-5xl px-6 py-12">{children}</main>
    </div>
  );
}

// Cabeçalho de página no padrão editorial: kicker mono numerado + display Syne
export function PageHeader({
  kicker,
  titulo,
  descricao,
}: {
  kicker: string;
  titulo: string;
  descricao?: string;
}) {
  return (
    <div className="mb-12 flex flex-col gap-3">
      <span className="font-mono text-xs tracking-[0.18em] text-tinta4">{kicker}</span>
      <h1 className="font-display text-4xl font-semibold tracking-tight">{titulo}</h1>
      {descricao ? <p className="max-w-xl text-tinta3">{descricao}</p> : null}
    </div>
  );
}
