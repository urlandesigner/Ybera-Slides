import { redirect } from "next/navigation";
import { AppShell, PageHeader } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { GeneratorClient } from "./generator-client";

export default async function NovaApresentacaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?erro=sessao");

  return (
    <AppShell email={user.email ?? ""} active="nova">
      <PageHeader
        kicker="BRIEFING"
        titulo="Nova apresentação"
        descricao="Preencha o briefing e receba um HTML no padrão visual Ybera, pronto para apresentar."
      />
      <GeneratorClient />
    </AppShell>
  );
}
