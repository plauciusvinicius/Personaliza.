import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CertificadosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: certs } = await supabase
    .from("progresso")
    .select("*, livros(titulo)")
    .eq("aluno_id", user!.id)
    .eq("aprovado", true)
    .order("atualizado_em", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-jurua-dark">Meus Certificados</h1>
        <p className="text-muted text-sm mt-1">
          {certs?.length ?? 0} certificado(s) emitido(s)
        </p>
      </div>

      {!certs || certs.length === 0 ? (
        <Card>
          <CardBody className="text-center py-16">
            <span className="text-5xl block mb-3">🏆</span>
            <p className="font-medium text-jurua-dark mb-2">Nenhum certificado ainda</p>
            <p className="text-sm text-muted mb-6">
              Complete um livro com nota ≥ 7,0 para receber seu certificado
            </p>
            <Link href="/aluno/biblioteca">
              <Button variant="secondary">Explorar biblioteca</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {certs.map((cert: any) => (
            <Card key={cert.id}>
              <CardBody className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-jurua-pale flex items-center justify-center text-2xl flex-shrink-0">
                    🏆
                  </div>
                  <div>
                    <p className="font-semibold text-jurua-dark">{cert.livros?.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="success">Aprovado</Badge>
                      <span className="text-sm text-muted">
                        Nota: <strong>{cert.nota_final?.toFixed(1)}</strong>
                      </span>
                    </div>
                  </div>
                </div>
                {cert.certificado_url ? (
                  <a href={cert.certificado_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="secondary">
                      ⬇ Baixar
                    </Button>
                  </a>
                ) : (
                  <span className="text-xs text-muted">Gerando...</span>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
