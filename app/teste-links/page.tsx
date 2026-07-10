import { LogoYbera } from "@/components/LogoYbera";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TestLinkForm } from "./test-link-form";

export default function TesteLinksPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-6">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="surgir w-full max-w-2xl">
        <div className="mb-12 flex flex-col gap-6">
          <LogoYbera className="h-10 w-auto self-start text-tinta" />
          <div className="flex flex-col gap-2">
            <p className="font-mono text-xs tracking-[0.18em] text-tinta3">ACESSO INTERNO DE TESTE</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-balance">
              Gerador de links manuais
            </h1>
            <p className="max-w-2xl text-tinta3">
              Use esta area apenas para testes controlados. O link gerado ignora o envio de e-mail do
              Supabase e deve ser compartilhado manualmente com pessoas especificas.
            </p>
          </div>
          <div className="border-t border-fio18" />
        </div>

        <TestLinkForm />
      </div>
    </div>
  );
}
