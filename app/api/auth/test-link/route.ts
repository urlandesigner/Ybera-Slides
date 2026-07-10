import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveAppOrigin } from "@/lib/auth/app-origin";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN ?? "ybera.com";
const ADMIN_KEY = process.env.TEST_LOGIN_ADMIN_KEY?.trim();

const bodySchema = z.object({
  email: z.string().email("E-mail inválido"),
  key: z.string().min(1, "Chave obrigatória"),
});

export async function POST(request: Request) {
  let email: string;
  let key: string;

  try {
    const body = bodySchema.parse(await request.json());
    email = body.email.trim().toLowerCase();
    key = body.key.trim();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  if (!ADMIN_KEY) {
    return NextResponse.json({ erro: "Modo de teste não configurado no servidor." }, { status: 503 });
  }

  if (key !== ADMIN_KEY) {
    return NextResponse.json({ erro: "Chave de acesso inválida." }, { status: 403 });
  }

  if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    return NextResponse.json(
      { erro: `Acesso restrito a e-mails @${ALLOWED_DOMAIN}.` },
      { status: 403 }
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json(
      { erro: "SUPABASE_SERVICE_ROLE_KEY não configurada no servidor." },
      { status: 503 }
    );
  }

  const admin = createAdminClient();
  const appOrigin = resolveAppOrigin(request);
  const redirectTo = new URL("/auth/confirm", `${appOrigin}/`).toString();

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo,
    },
  });

  if (error) {
    console.error("[auth/test-link] falha ao gerar link:", error.message);
    return NextResponse.json({ erro: "Não foi possível gerar o link agora." }, { status: 500 });
  }

  const actionLink = data.properties.action_link;
  const hashedToken = data.properties.hashed_token;
  const verificationType = data.properties.verification_type;

  if (!actionLink || !hashedToken || !verificationType) {
    return NextResponse.json({ erro: "O Supabase não retornou um link utilizável." }, { status: 500 });
  }

  // Evita depender da Site URL do Supabase, que pode estar apontando para localhost.
  const hostedLink = new URL("/auth/confirm", `${appOrigin}/`);
  hostedLink.searchParams.set("token_hash", hashedToken);
  hostedLink.searchParams.set("type", verificationType);

  return NextResponse.json({
    ok: true,
    email,
    link: hostedLink.toString(),
    supabaseLink: actionLink,
    redirectTo,
  });
}
