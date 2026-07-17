import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const BUCKET = "deck-images";
const MAX_BYTES = 5 * 1024 * 1024;
const TIPOS = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

let bucketPronto = false;

async function garantirBucket() {
  if (bucketPronto) return;
  const admin = createAdminClient();
  const { data: buckets } = await admin.storage.listBuckets();
  if (!buckets?.some((b) => b.id === BUCKET)) {
    const { error } = await admin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: [...TIPOS],
    });
    if (error && !/already exists/i.test(error.message)) {
      throw error;
    }
  }
  bucketPronto = true;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ erro: "Sessão expirada. Entre de novo." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ erro: "Envie a imagem como formulário" }, { status: 400 });
  }

  const file = form.get("file");
  // Undici pode devolver Blob/File — aceita os dois.
  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ erro: "Arquivo de imagem obrigatório" }, { status: 400 });
  }

  const nome = "name" in file && typeof file.name === "string" ? file.name : "upload";
  let tipo = file.type;
  if (!TIPOS.has(tipo)) {
    const ext = nome.split(".").pop()?.toLowerCase();
    const porExt: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    tipo = (ext && porExt[ext]) || "";
  }
  if (!TIPOS.has(tipo)) {
    return NextResponse.json(
      { erro: "Use JPEG, PNG, WebP ou GIF" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ erro: "Imagem no máximo 5 MB" }, { status: 400 });
  }

  try {
    await garantirBucket();
  } catch (err) {
    console.error("[upload-image] bucket:", err);
    return NextResponse.json(
      { erro: "Storage não configurado. Rode supabase/storage-deck-images.sql no Supabase." },
      { status: 503 }
    );
  }

  const ext = EXT[tipo] ?? "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  // Service role evita dependência de policies manuais; path ainda fica sob o user_id.
  const admin = createAdminClient();
  const { error } = await admin.storage.from(BUCKET).upload(path, bytes, {
    contentType: tipo,
    upsert: false,
  });
  if (error) {
    console.error("[upload-image]", error.message);
    return NextResponse.json({ erro: "Não foi possível enviar a imagem" }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
