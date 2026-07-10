import Link from "next/link";
import { Button } from "@/components/Button";
import { LogoYbera } from "@/components/LogoYbera";
import { UserMenu } from "@/components/UserMenu";

// Casca do app: cabeçalho operacional com navegação, e-mail e saída. Sem hero, sem sombras.
export function AppShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-fio">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4 sm:gap-4 sm:px-6 sm:py-5">
          <Link href="/" className="flex items-center text-tinta">
            <LogoYbera className="h-6 w-auto sm:h-7" />
          </Link>
          <div className="flex items-center gap-3">
            {/* Rótulo completo não cabe ao lado do logo + avatar em 375px.
                Dois spans completos (não um texto+span dividindo o espaço):
                o botão é inline-flex, então cada filho vira item de flex e o
                espaço no início de um span filho é cortado pela regra de
                whitespace de início de linha do CSS. */}
            <Button href="/nova" variant="primary">
              <span className="sm:hidden">+ NOVA</span>
              <span className="hidden sm:inline">+ NOVA APRESENTAÇÃO</span>
            </Button>
            <UserMenu email={email} />
          </div>
        </div>
      </header>
      <main className="surgir mx-auto w-full max-w-5xl flex-1 px-5 py-8 sm:px-6 sm:py-12">{children}</main>
      <footer className="border-t border-fio">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-6">
          <p className="font-mono text-xs tracking-[0.1em] text-tinta4">
            Ferramenta interna do Grupo Ybera — conteúdo confidencial, não divulgar fora da empresa.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Cabeçalho de página no padrão editorial: kicker mono numerado + display Syne
export function PageHeader({
  kicker,
  titulo,
  descricao,
}: {
  kicker?: string;
  titulo: string;
  descricao?: string;
}) {
  return (
    <div className="mb-12 flex flex-col gap-3">
      {kicker ? (
        <span className="font-mono text-xs tracking-[0.18em] text-tinta3">{kicker}</span>
      ) : null}
      <h1 className="font-display text-4xl font-semibold tracking-tight">{titulo}</h1>
      {descricao ? <p className="max-w-xl text-tinta3">{descricao}</p> : null}
    </div>
  );
}
