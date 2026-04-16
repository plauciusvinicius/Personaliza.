import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function LivroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: livro } = await supabase
    .from("livros")
    .select("*")
    .eq("id", id)
    .eq("status", "done")
    .single();

  if (!livro) notFound();

  const { data: episodios } = await supabase
    .from("episodios")
    .select("*")
    .eq("livro_id", id)
    .order("numero");

  const { data: prog } = await supabase
    .from("progresso")
    .select("*")
    .eq("aluno_id", user!.id)
    .eq("livro_id", id)
    .single();

  const completados = prog?.episodios_completados ?? [];
  const total = episodios?.length ?? 0;
  const pct = total > 0 ? Math.round((completados.length / total) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header do livro */}
      <div className="mb-8">
        <Link href="/aluno/biblioteca" className="text-sm text-jurua-accent hover:underline mb-4 block">
          ← Biblioteca
        </Link>
        <div className="flex items-start gap-4">
          <div className="w-16 h-20 rounded-lg bg-jurua-pale flex items-center justify-center flex-shrink-0">
            {livro.thumb_url ? (
              <img src={livro.thumb_url} alt={livro.titulo} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-3xl">📖</span>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-jurua-dark">{livro.titulo}</h1>
            <p className="text-sm text-muted mt-1">{total} episódio(s)</p>
            {prog?.aprovado && (
              <Badge variant="success" className="mt-2">✓ Certificado emitido</Badge>
            )}
          </div>
        </div>

        {/* Progresso geral */}
        {total > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-white border border-border">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-jurua-dark font-medium">Seu progresso</span>
              <span className="text-muted">{completados.length}/{total} episódios</span>
            </div>
            <div className="h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-jurua-accent rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted">{pct}% concluído</span>
              {pct === 100 && !prog?.nota_final && (
                <Link href={`/aluno/livro/${id}/teste-final`}>
                  <Button size="sm" variant="success">Fazer teste final</Button>
                </Link>
              )}
              {prog?.certificado_url && (
                <a href={prog.certificado_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="secondary">⬇ Certificado</Button>
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lista de episódios */}
      <div className="flex flex-col gap-3">
        {episodios?.map((ep) => {
          const done = completados.includes(ep.numero);
          return (
            <Card key={ep.id}>
              <CardBody>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold bg-jurua-pale text-jurua-primary">
                    {done ? "✓" : ep.numero}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-jurua-dark">{ep.titulo}</p>
                    <p className="text-xs text-muted mt-0.5">{ep.chars.toLocaleString()} caracteres</p>
                    {/* Formatos disponíveis */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {ep.audiobook_url && (
                        <a href={ep.audiobook_url} target="_blank" rel="noopener noreferrer">
                          <Badge variant="info">🎧 Audiobook</Badge>
                        </a>
                      )}
                      {ep.video_url && (
                        <a href={ep.video_url} target="_blank" rel="noopener noreferrer">
                          <Badge variant="processing">🎬 Vídeo</Badge>
                        </a>
                      )}
                      {ep.slides_url && (
                        <a href={ep.slides_url} target="_blank" rel="noopener noreferrer">
                          <Badge variant="default">📊 Slides</Badge>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end flex-shrink-0">
                    <Link href={`/aluno/livro/${id}/quiz?ep=${ep.id}`}>
                      <Button size="sm" variant={done ? "ghost" : "secondary"}>
                        {done ? "Refazer quiz" : "Fazer quiz"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
