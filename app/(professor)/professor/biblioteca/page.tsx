import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const statusMap = {
  pending: { label: "Aguardando", variant: "warning" as const },
  processing: { label: "Processando", variant: "processing" as const },
  done: { label: "Concluído", variant: "success" as const },
  error: { label: "Erro", variant: "danger" as const },
};

export default async function BibliotecaProfessorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: livros } = await supabase
    .from("livros")
    .select("*")
    .eq("professor_id", user!.id)
    .order("criado_em", { ascending: false });

  const totais = {
    total: livros?.length ?? 0,
    done: livros?.filter((l: any) => l.status === "done").length ?? 0,
    processing: livros?.filter((l: any) => l.status === "processing" || l.status === "pending").length ?? 0,
    error: livros?.filter((l: any) => l.status === "error").length ?? 0,
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-jurua-dark">Minha Biblioteca</h1>
          <p className="text-muted text-sm mt-1">Todos os seus PDFs enviados e seus conteúdos gerados</p>
        </div>
        <Link href="/professor/upload">
          <Button>+ Enviar PDF</Button>
        </Link>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total", value: totais.total, color: "text-jurua-dark" },
          { label: "Concluídos", value: totais.done, color: "text-green-600" },
          { label: "Em processo", value: totais.processing, color: "text-yellow-600" },
          { label: "Com erro", value: totais.error, color: "text-red-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody className="text-center py-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted mt-0.5">{s.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Lista */}
      {!livros || livros.length === 0 ? (
        <Card>
          <CardBody className="text-center py-16">
            <span className="text-5xl block mb-3">📚</span>
            <p className="font-medium text-jurua-dark mb-2">Biblioteca vazia</p>
            <p className="text-sm text-muted mb-6">
              Envie seu primeiro PDF para começar a gerar conteúdo
            </p>
            <Link href="/professor/upload">
              <Button>Enviar primeiro PDF</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {livros.map((livro: any) => {
            const { label, variant } = statusMap[livro.status as keyof typeof statusMap] ?? statusMap.pending;
            return (
              <Card key={livro.id} className="hover:shadow-md transition-shadow">
                <CardBody className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-jurua-pale flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📖</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-jurua-dark truncate">{livro.titulo}</p>
                      <p className="text-xs text-muted mt-0.5">
                        Enviado em {formatDate(livro.criado_em)}
                        {livro.total_episodios > 0 && ` · ${livro.total_episodios} episódio(s)`}
                      </p>
                      {livro.descricao && (
                        <p className="text-xs text-muted mt-1 line-clamp-1">{livro.descricao}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={variant}>{label}</Badge>
                    {livro.status === "done" && (
                      <Link href={`/professor/biblioteca/${livro.id}`}>
                        <Button size="sm" variant="secondary">Ver detalhes</Button>
                      </Link>
                    )}
                    {livro.status === "processing" && (
                      <span className="text-xs text-muted flex items-center gap-1.5">
                        <span className="inline-block w-3 h-3 rounded-full border-2 border-jurua-accent border-t-transparent animate-spin" />
                        Processando…
                      </span>
                    )}
                    {livro.status === "error" && (
                      <Link href="/professor/upload">
                        <Button size="sm" variant="danger">Reenviar</Button>
                      </Link>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
