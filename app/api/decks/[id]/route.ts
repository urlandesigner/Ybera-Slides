import { NextResponse } from "next/server";
import { z } from "zod";
import { visibilidadeSchema } from "@/lib/schema";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({ visibilidade: visibilidadeSchema });

// Troca a visibilidade de uma apresentação. Só o dono (RLS + checagem explícita).
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Sessão expirada. Entre de novo.", codigo: "sessao" }, { status: 401 });
  }

  let visibilidade;
  try {
    ({ visibilidade } = bodySchema.parse(await request.json()));
  } catch {
    return NextResponse.json({ erro: "Visibilidade inválida", codigo: "briefing" }, { status: 400 });
  }

  const { id } = await params;
  const { data: atualizado, error } = await supabase
    .from("decks")
    .update({ visibilidade })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, visibilidade")
    .single();

  if (error || !atualizado) {
    return NextResponse.json(
      { erro: "Só quem criou a apresentação pode mudar a visibilidade", codigo: "permissao" },
      { status: 403 }
    );
  }

  return NextResponse.json(atualizado);
}
