import { redirect } from "next/navigation";
import { LogoYbera } from "@/components/LogoYbera";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

const AVISOS: Record<string, string> = {
  link: "Este link de acesso expirou ou já foi usado. Peça um novo.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  const { erro } = await searchParams;
  const aviso = erro ? (AVISOS[erro] ?? null) : null;
  const ano = new Date().getFullYear();

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="surgir w-full max-w-md">
        {/* Eco da capa dos decks: logo oficial + selo com ponto de acento + display Syne */}
        <div className="mb-12 flex flex-col gap-6">
          <LogoYbera className="h-10 w-auto self-start text-tinta" />
          <div className="flex w-fit items-center gap-2.5 rounded-full border border-fio18 px-4 py-1.5">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-tinta3" />
            <span className="font-mono text-[10px] tracking-[0.18em] text-tinta3">
              FERRAMENTA INTERNA · {ano}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-balance">
              Gerador de Apresentações
            </h1>
            <p className="text-tinta3">
              Briefing entra, apresentação no padrão Ybera sai.
            </p>
          </div>
          <div className="border-t border-fio18" />
        </div>
        <LoginForm avisoInicial={aviso} />
      </div>
    </div>
  );
}
