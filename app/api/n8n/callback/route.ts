import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Este endpoint é chamado pelo N8N após concluir o processamento de cada episódio / livro completo
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-portal-secret") || "";
  if (secret !== process.env.N8N_SECRET) {
    return NextResponse.json({ error: "Segredo inválido" }, { status: 401 });
  }

  const body = await req.json();
  const {
    livroId,
    step,         // "episodio" | "livro_completo" | "quiz_gerado"
    status,       // "ok" | "error"
    mensagem,
    // campos do episódio (quando step === "episodio")
    episodioNumero,
    episodioTitulo,
    episodioChars,
    audiobookUrl,
    videoUrl,
    slidesUrl,
    thumbUrl,
    // campos do livro (quando step === "livro_completo")
    totalEpisodios,
    // campos do quiz (quando step === "quiz_gerado")
    episodioId,
    perguntas,    // array de { pergunta, opcao_a, opcao_b, opcao_c, opcao_d, resposta_correta }
  } = body;

  if (!livroId) {
    return NextResponse.json({ error: "livroId obrigatório" }, { status: 400 });
  }

  // Usar service_role key para bypass de RLS
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Log do evento
  await supabase.from("processamento_log").insert({
    livro_id: livroId,
    step: step || "callback",
    status: status === "ok" ? "ok" : "error",
    mensagem: mensagem || null,
  });

  if (status !== "ok") {
    // Marcar livro como erro se for falha fatal
    if (step === "livro_completo") {
      await supabase.from("livros").update({ status: "error" }).eq("id", livroId);
    }
    return NextResponse.json({ ok: true });
  }

  // Episódio concluído
  if (step === "episodio" && episodioNumero) {
    await supabase.from("episodios").upsert(
      {
        livro_id: livroId,
        numero: episodioNumero,
        titulo: episodioTitulo || `Episódio ${episodioNumero}`,
        chars: episodioChars || 0,
        audiobook_url: audiobookUrl || null,
        video_url: videoUrl || null,
        slides_url: slidesUrl || null,
        thumb_url: thumbUrl || null,
        status: "done",
      },
      { onConflict: "livro_id,numero" }
    );
  }

  // Quiz gerado para um episódio
  if (step === "quiz_gerado" && episodioId && Array.isArray(perguntas)) {
    const inserts = perguntas.map((p: any) => ({
      episodio_id: episodioId,
      pergunta: p.pergunta,
      opcao_a: p.opcao_a,
      opcao_b: p.opcao_b,
      opcao_c: p.opcao_c,
      opcao_d: p.opcao_d,
      resposta_correta: p.resposta_correta,
    }));
    await supabase.from("quiz_perguntas").insert(inserts);
  }

  // Livro completamente processado
  if (step === "livro_completo" && totalEpisodios) {
    await supabase
      .from("livros")
      .update({ status: "done", total_episodios: totalEpisodios })
      .eq("id", livroId);
  }

  return NextResponse.json({ ok: true });
}
