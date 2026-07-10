import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { createClient } from "@/lib/supabase/server";
import { GeneratorClient } from "../generator-client";

export default async function NovaApresentacaoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <AppShell email={user.email ?? ""}>
      <GeneratorClient />
    </AppShell>
  );
}
