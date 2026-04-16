import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AlunoDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: progresso } = await supabase
    .from("progresso")
    .select("*, livros(titulo, thumb_url, total_episodios)")
    .eq("aluno_id", user!.id)
    .order("atualizado_em", { ascending: false })
    .limit(5);

  const { data: livros } = await supabase
    .from("livros")
    .select("id, titulo, thumb_url, total_episodios")
    .eq("status", "done")
    .order("criado_em", { ascending: false })
    .limit(6);

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-jurua-dark">Início</h1>
        <p className="text-muted text-sm mt-1">Continue seus estudos ou explore novos conteúdos</p>
      </div>

      {/* Continuar estudando */}
      {progresso && progresso.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-jurua-dark mb-4">Continuar estudando</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {progresso.map((p: any) => {
              const livro = p.livros;
              const pct = livro?.total_episodios
                ? Math.round((p.episodios_completados.length / livro.total_episodios) * 100)
                : 0;
              return (
                <Card key={p.id}>
                  <CardBody className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">📖</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-jurua-dark text-sm truncate">{livro?.titulo}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {p.episodios_completados.length}/{livro?.total_episodios} episódios
                        </p>
                      </div>
                    </div>
                    {/* Barra de progresso */}
                    <div className="h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-jurua-accent rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">{pct}% concluído</span>
                      {p.aprovado && <Badge variant="success">Certificado ✓</Badge>}
                    </div>
                    <Link href={`/aluno/livro/${p.livro_id}`}>
                      <Button size="sm" variant="secondary" className="w-full">
                        Continuar
                      </Button>
                    </Link>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Biblioteca */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-jurua-dark">Biblioteca disponível</h2>
          <Link href="/aluno/biblioteca" className="text-sm text-jurua-accent hover:underline">
            Ver todos →
          </Link>
        </div>

        {!livros || livros.length === 0 ? (
          <Card>
            <CardBody className="text-center py-10">
              <span className="text-4xl block mb-2">📚</span>
              <p className="text-muted text-sm">Nenhum conteúdo disponível ainda</p>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {livros.map((livro) => (
              <Link key={livro.id} href={`/aluno/livro/${livro.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardBody className="flex items-center gap-3">
                    <span className="text-3xl">📖</span>
                    <div className="min-w-0">
                      <p className="font-medium text-jurua-dark text-sm truncate">{livro.titulo}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {livro.total_episodios} episódio(s)
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
