import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveAppOrigin } from "@/lib/auth/app-origin";
import { createClient } from "@/lib/supabase/server";

// Validação do domínio NO SERVIDOR — o client também valida, mas esta é a barreira real.
const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN ?? "ybera.com";

const bodySchema = z.object({ email: z.string().email("E-mail inválido") });

export async function POST(request: Request) {
  let email: string;
  try {
    const body = await request.json();
    email = bodySchema.parse(body).email.trim().toLowerCase();
  } catch {
    return NextResponse.json({ erro: "E-mail inválido" }, { status: 400 });
  }

  if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    return NextResponse.json(
      { erro: `Acesso restrito a e-mails @${ALLOWED_DOMAIN}. Verifique o endereço digitado.` },
      { status: 403 }
    );
  }

  const appOrigin = resolveAppOrigin(request);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: new URL("/auth/confirm", `${appOrigin}/`).toString(),
      // Cria o usuário no primeiro acesso — o domínio já foi validado acima.
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("[auth/login] falha ao enviar magic link:", error.message);

    const message = error.message.toLowerCase();
    if (message.includes("rate limit")) {
      return NextResponse.json(
        { erro: "Muitos envios seguidos para este e-mail. Aguarde alguns minutos e tente novamente." },
        { status: 429 }
      );
    }

    if (message.includes("redirect") && message.includes("not allowed")) {
      return NextResponse.json(
        { erro: "A URL local deste app ainda não foi liberada no Supabase. Adicione esta URL de retorno e tente de novo." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { erro: "Não foi possível enviar o link. Tente de novo em instantes." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
