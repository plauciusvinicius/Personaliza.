import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Verificar que é professor
  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single();

  if (profile?.tipo !== "professor") {
    return NextResponse.json({ error: "Apenas professores podem enviar PDFs" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const titulo = (formData.get("titulo") as string) || "sem-titulo";

  if (!file || file.type !== "application/pdf") {
    return NextResponse.json({ error: "Arquivo PDF inválido" }, { status: 400 });
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "Arquivo muito grande (máx 50MB)" }, { status: 400 });
  }

  // Criar registro do livro no Supabase
  const slug = slugify(titulo);
  const { data: livro, error: livroErr } = await supabase
    .from("livros")
    .insert({
      titulo,
      slug,
      professor_id: user.id,
      status: "pending",
      total_episodios: 0,
    })
    .select()
    .single();

  if (livroErr || !livro) {
    return NextResponse.json({ error: "Erro ao criar registro do livro" }, { status: 500 });
  }

  // Converter arquivo para base64
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileBase64 = buffer.toString("base64");

  // Enviar para o N8N
  const n8nUrl = process.env.N8N_WEBHOOK_URL;
  if (!n8nUrl) {
    return NextResponse.json({ error: "N8N não configurado" }, { status: 500 });
  }

  try {
    const n8nRes = await fetch(n8nUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-n8n-secret": process.env.N8N_SECRET || "",
      },
      body: JSON.stringify({
        itemId: livro.id,
        title: titulo,
        fileName: file.name,
        fileBase64,
        portalCallbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/n8n/callback`,
        portalSecret: process.env.N8N_SECRET,
      }),
    });

    if (!n8nRes.ok) {
      await supabase.from("livros").update({ status: "error" }).eq("id", livro.id);
      return NextResponse.json({ error: "Falha ao enviar para processamento" }, { status: 502 });
    }

    // Atualizar status para processing
    await supabase
      .from("livros")
      .update({ status: "processing" })
      .eq("id", livro.id);

    // Log
    await supabase.from("processamento_log").insert({
      livro_id: livro.id,
      step: "upload",
      status: "started",
      mensagem: `PDF enviado para N8N: ${file.name}`,
    });

    return NextResponse.json({ ok: true, livroId: livro.id, titulo });
  } catch (err) {
    await supabase.from("livros").update({ status: "error" }).eq("id", livro.id);
    return NextResponse.json({ error: "Erro interno ao processar envio" }, { status: 500 });
  }
}
