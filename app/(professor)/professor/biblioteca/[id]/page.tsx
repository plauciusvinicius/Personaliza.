import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export default async function LivroProfessorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: livro } = await supabase
    .from("livros")
    .select("*")
    .eq("id", id)
    .eq("professor_id", user!.id)
    .single();

  if (!livro) notFound();

  const { data: episodios } = await supabase
    .from("episodios")
    .select("*")
    .eq("livro_id", id)
    .order("numero");

  // Estatísticas de alunos
  const { data: progressos } = await supabase
    .from("progresso")
    .select("aluno_id, aprovado, nota_final")
    .eq("livro_id", id);

  const totalAlunos = progressos?.length ?? 0;
  const aprovados = progressos?.filter((p: any) => p.aprovado).length ?? 0;
  const mediaNotas = progressos && progressos.length > 0
    ? progressos
        .filter((p: any) => p.nota_final != null)
        .reduce((acc: number, p: any) => acc + (p.nota_final ?? 0), 0) /
      (progressos.filter((p: any) => p.nota_final != null).length || 1)
    : null;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Link href="/professor/biblioteca" className="text-sm text-jurua-accent hover:underline mb-6 block">
        ← Minha Biblioteca
      </Link>

      {/* Cabeçalho do livro */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-20 rounded-lg bg-jurua-pale flex items-center justify-center flex-shrink-0 text-3xl">
            📖
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-jurua-dark">{(livro as any).titulo}</h1>
            <p className="text-sm text-muted mt-1">
              Enviado em {formatDate((livro as any).criado_em)} · {(livro as any).total_episodios} episódio(s)
            </p>
            {(livro as any).descricao && (
              <p className="text-sm text-muted mt-2">{(livro as any).descricao}</p>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas de alunos */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Alunos matriculados", value: totalAlunos, icon: "👩‍🎓" },
          { label: "Certificados emitidos", value: aprovados, icon: "🏆" },
          {
            label: "Média das notas",
            value: mediaNotas != null ? mediaNotas.toFixed(1) : "—",
            icon: "📊",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody className="flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xl font-bold text-jurua-dark">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Episódios */}
      <h2 className="text-lg font-semibold text-jurua-dark mb-4">
        Episódios ({episodios?.length ?? 0})
      </h2>

      {!episodios || episodios.length === 0 ? (
        <Card>
          <CardBody className="text-center py-10">
            <p className="text-muted text-sm">Nenhum episódio gerado ainda.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {episodios.map((ep: any) => (
            <Card key={ep.id}>
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-jurua-pale flex items-center justify-center text-sm font-bold text-jurua-primary flex-shrink-0">
                    {ep.numero}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-jurua-dark">{ep.titulo}</p>
                    <p className="text-xs text-muted mt-0.5">{ep.chars?.toLocaleString()} caracteres</p>

                    {/* Links de mídia gerada */}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {ep.audiobook_url ? (
                        <a href={ep.audiobook_url} target="_blank" rel="noopener noreferrer">
                          <Badge variant="info">🎧 Audiobook</Badge>
                        </a>
                      ) : (
                        <Badge variant="warning">🎧 Audiobook pendente</Badge>
                      )}
                      {ep.video_url ? (
                        <a href={ep.video_url} target="_blank" rel="noopener noreferrer">
                          <Badge variant="processing">🎬 Vídeo</Badge>
                        </a>
                      ) : (
                        <Badge variant="default">🎬 Vídeo pendente</Badge>
                      )}
                      {ep.slides_url ? (
                        <a href={ep.slides_url} target="_blank" rel="noopener noreferrer">
                          <Badge variant="default">📊 Slides</Badge>
                        </a>
                      ) : (
                        <Badge variant="default">📊 Slides pendente</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/professor/upload">
          <Button variant="secondary">+ Enviar outro PDF</Button>
        </Link>
      </div>
    </div>
  );
}
