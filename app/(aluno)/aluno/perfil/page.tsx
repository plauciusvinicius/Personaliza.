import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AlterarSenhaCard } from "@/components/ui/AlterarSenhaCard";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function AlunoPerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: progressos } = await supabase
    .from("progresso")
    .select("livro_id, aprovado, nota_final, episodios_completados")
    .eq("aluno_id", user!.id);

  const totalLivros = progressos?.length ?? 0;
  const certificados = progressos?.filter((p) => p.aprovado).length ?? 0;
  const mediaNotas = progressos && progressos.length > 0
    ? progressos
        .filter((p) => p.nota_final != null)
        .reduce((acc, p) => acc + (p.nota_final ?? 0), 0) /
      (progressos.filter((p) => p.nota_final != null).length || 1)
    : null;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-jurua-dark">Meu Perfil</h1>
        <p className="text-muted text-sm mt-1">Suas informações e configurações de acesso</p>
      </div>

      {/* Dados */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-jurua-dark">Informações da conta</h2>
        </CardHeader>
        <CardBody>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-jurua-pale flex items-center justify-center text-2xl flex-shrink-0">
              📚
            </div>
            <div>
              <p className="font-bold text-jurua-dark text-lg">{profile?.nome}</p>
              <span className="inline-block bg-jurua-pale text-jurua-primary text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5">
                Aluno
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-border bg-jurua-cream p-3">
              <p className="text-muted text-xs mb-1">E-mail</p>
              <p className="font-medium text-jurua-dark">{profile?.email}</p>
            </div>
            <div className="rounded-lg border border-border bg-jurua-cream p-3">
              <p className="text-muted text-xs mb-1">Telefone</p>
              <p className="font-medium text-jurua-dark">{profile?.telefone || "—"}</p>
            </div>
            <div className="rounded-lg border border-border bg-jurua-cream p-3">
              <p className="text-muted text-xs mb-1">Membro desde</p>
              <p className="font-medium text-jurua-dark">{formatDate(profile?.criado_em ?? "")}</p>
            </div>
            <div className="rounded-lg border border-border bg-jurua-cream p-3">
              <p className="text-muted text-xs mb-1">Desempenho</p>
              <div className="flex items-center gap-2">
                <p className="font-medium text-jurua-dark">
                  {totalLivros} livro(s) · {certificados} cert.
                </p>
                {mediaNotas != null && (
                  <Badge variant={mediaNotas >= 7 ? "success" : "warning"}>
                    Média {mediaNotas.toFixed(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Alterar senha */}
      <AlterarSenhaCard />

      <div className="mt-4 text-xs text-muted text-center">
        Caso não lembre sua senha atual, use a opção{" "}
        <a href="/auth/forgot-password" className="text-jurua-accent hover:underline">
          Esqueci minha senha
        </a>{" "}
        na tela de login.
      </div>
    </div>
  );
}
