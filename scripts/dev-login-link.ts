// Gera um link de login mágico sem enviar e-mail (usa a Admin API do Supabase).
// Só pra testar o fluxo localmente sem esbarrar no rate limit de e-mail do Supabase.
// Uso: npx tsx scripts/dev-login-link.ts seu-email@ybera.com
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of fs.readFileSync(".env.local", "utf-8").split("\n")) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npx tsx scripts/dev-login-link.ts seu-email@ybera.com");
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error) throw error;

  const link = `http://localhost:3000/auth/confirm?token_hash=${data.properties.hashed_token}&type=magiclink`;
  console.log("\nAbra este link no navegador pra logar (uso único):\n");
  console.log(link, "\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
