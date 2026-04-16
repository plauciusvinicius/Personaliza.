import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// Gera um certificado simples em HTML/PDF e retorna a URL
// Em produção: integrar com um serviço de geração de PDF (ex: Puppeteer via VPS, ou API)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { livroId, nota } = await req.json();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome")
    .eq("id", user.id)
    .single();

  const { data: livro } = await supabase
    .from("livros")
    .select("titulo")
    .eq("id", livroId)
    .single();

  if (!livro || !profile) {
    return NextResponse.json({ error: "Livro ou usuário não encontrado" }, { status: 404 });
  }

  // Por ora retorna URL de um certificado HTML gerado inline
  // TODO: integrar Puppeteer no VPS para gerar PDF real
  const certData = {
    nome: profile.nome,
    livro: livro.titulo,
    nota,
    data: new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
  };

  // Gerar página de certificado como URL de dados (temporário)
  // Em produção: fazer POST para VPS Hostinger que usa Puppeteer + retorna URL do Drive
  const certHtml = buildCertificadoHtml(certData);

  // Salvar no Supabase Storage
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const fileName = `certificados/${user.id}/${livroId}.html`;
  const { error: uploadErr } = await admin.storage
    .from("certificados")
    .upload(fileName, certHtml, {
      contentType: "text/html",
      upsert: true,
    });

  if (uploadErr) {
    // Fallback: retornar sem URL (geração posterior)
    return NextResponse.json({ ok: true, url: null });
  }

  const { data: { publicUrl } } = admin.storage
    .from("certificados")
    .getPublicUrl(fileName);

  return NextResponse.json({ ok: true, url: publicUrl });
}

function buildCertificadoHtml({
  nome,
  livro,
  nota,
  data,
}: {
  nome: string;
  livro: string;
  nota: number;
  data: string;
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Certificado — Editora Juruá</title>
  <style>
    body { margin: 0; background: #f7faf2; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: Georgia, serif; }
    .cert { max-width: 800px; margin: 40px auto; background: white; border: 8px solid #2D4A1E; border-radius: 16px; padding: 60px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
    .logo { font-size: 2rem; font-weight: bold; color: #2D4A1E; letter-spacing: 2px; margin-bottom: 8px; }
    .sub { color: #5A8A35; font-size: 0.9rem; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 40px; }
    h1 { font-size: 2.5rem; color: #1E3610; margin: 20px 0 8px; }
    .nome { font-size: 2rem; color: #2D4A1E; font-style: italic; margin: 20px 0; border-bottom: 2px solid #5A8A35; display: inline-block; padding-bottom: 8px; }
    .livro { font-size: 1.1rem; color: #3B5C24; font-weight: bold; margin: 16px 0; }
    .nota { font-size: 1.5rem; color: #5A8A35; font-weight: bold; margin: 24px 0; }
    .data { color: #6B7C5A; font-size: 0.9rem; margin-top: 40px; }
    .footer { color: #8AB85A; font-size: 0.8rem; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="logo">JURUÁ</div>
    <div class="sub">Editora</div>
    <h1>Certificado de Conclusão</h1>
    <p>Certificamos que</p>
    <div class="nome">${nome}</div>
    <p>concluiu com êxito o estudo da obra</p>
    <p class="livro">"${livro}"</p>
    <p class="nota">Nota Final: ${nota.toFixed(1)} / 10,0</p>
    <p class="data">Emitido em ${data}</p>
    <p class="footer">Portal Educacional — Editora Juruá</p>
  </div>
</body>
</html>`;
}
