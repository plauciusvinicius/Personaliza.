import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";

export default async function BibliotecaPage() {
  const supabase = await createClient();
  const { data: livros } = await supabase
    .from("livros")
    .select("id, titulo, total_episodios, thumb_url, descricao, criado_em")
    .eq("status", "done")
    .order("criado_em", { ascending: false });

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-jurua-dark">Biblioteca</h1>
        <p className="text-muted text-sm mt-1">
          {livros?.length ?? 0} livro(s) disponível(is)
        </p>
      </div>

      {!livros || livros.length === 0 ? (
        <Card>
          <CardBody className="text-center py-16">
            <span className="text-5xl block mb-3">📚</span>
            <p className="font-medium text-jurua-dark mb-1">Nenhum conteúdo disponível ainda</p>
            <p className="text-sm text-muted">Volte em breve para novos livros</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {livros.map((livro) => (
            <Link key={livro.id} href={`/aluno/livro/${livro.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer group h-full">
                <div className="h-40 rounded-t-xl bg-jurua-pale flex items-center justify-center">
                  {livro.thumb_url ? (
                    <img
                      src={livro.thumb_url}
                      alt={livro.titulo}
                      className="w-full h-full object-cover rounded-t-xl"
                    />
                  ) : (
                    <span className="text-6xl">📖</span>
                  )}
                </div>
                <CardBody>
                  <h3 className="font-semibold text-jurua-dark text-sm line-clamp-2 group-hover:text-jurua-accent transition-colors">
                    {livro.titulo}
                  </h3>
                  {livro.descricao && (
                    <p className="text-xs text-muted mt-1 line-clamp-2">{livro.descricao}</p>
                  )}
                  <p className="text-xs text-jurua-accent font-medium mt-2">
                    {livro.total_episodios} episódio(s)
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
