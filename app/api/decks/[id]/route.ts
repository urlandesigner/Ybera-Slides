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

// Exclui uma apresentação (soft delete). Só o dono. A linha permanece no banco
// pra cota diária continuar contando — sem RETURNING, porque a linha excluída
// deixa de passar no filtro das telas.
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Sessão expirada. Entre de novo.", codigo: "sessao" }, { status: 401 });
  }

  const { id } = await params;
  const { error, count } = await supabase
    .from("decks")
    .update({ deleted_at: new Date().toISOString() }, { count: "exact" })
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null);

  if (error || !count) {
    if (error) console.error("[decks] erro ao excluir:", error.message);
    return NextResponse.json(
      { erro: "Só quem criou a apresentação pode excluí-la", codigo: "permissao" },
      { status: 403 }
    );
  }

  return NextResponse.json({ ok: true });
}
