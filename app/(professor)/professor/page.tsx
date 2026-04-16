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

export default async function ProfessorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: livros } = await supabase
    .from("livros")
    .select("*")
    .eq("professor_id", user!.id)
    .order("criado_em", { ascending: false })
    .limit(10);

  const totais = {
    total: livros?.length ?? 0,
    done: livros?.filter((l) => l.status === "done").length ?? 0,
    processing: livros?.filter((l) => l.status === "processing").length ?? 0,
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-jurua-dark">Dashboard</h1>
          <p className="text-muted text-sm mt-1">Gerencie seus livros e conteúdos</p>
        </div>
        <Link href="/professor/upload">
          <Button>+ Enviar PDF</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total de livros", value: totais.total, icon: "📚" },
          { label: "Processados", value: totais.done, icon: "✅" },
          { label: "Em processamento", value: totais.processing, icon: "⚙️" },
        ].map((s) => (
          <Card key={s.label}>
            <CardBody className="flex items-center gap-3">
              <span className="text-3xl">{s.icon}</span>
              <div>
                <p className="text-2xl font-bold text-jurua-dark">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Lista de livros recentes */}
      <h2 className="text-lg font-semibold text-jurua-dark mb-4">Últimos envios</h2>

      {!livros || livros.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <span className="text-5xl block mb-3">📁</span>
            <p className="text-jurua-dark font-medium mb-2">Nenhum PDF enviado ainda</p>
            <p className="text-sm text-muted mb-6">
              Envie seu primeiro PDF e veja a mágica acontecer
            </p>
            <Link href="/professor/upload">
              <Button>Enviar primeiro PDF</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {livros.map((livro) => {
            const { label, variant } = statusMap[livro.status] ?? statusMap.pending;
            return (
              <Card key={livro.id}>
                <CardBody className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0">📖</span>
                    <div className="min-w-0">
                      <p className="font-medium text-jurua-dark truncate">{livro.titulo}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {formatDate(livro.criado_em)} · {livro.total_episodios} episódio(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={variant}>{label}</Badge>
                    {livro.status === "done" && (
                      <Link href={`/professor/biblioteca/${livro.id}`}>
                        <Button size="sm" variant="secondary">Ver</Button>
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
