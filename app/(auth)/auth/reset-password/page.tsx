"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody, CardFooter } from "@/components/ui/card";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessaoOk, setSessaoOk] = useState(false);
  const [verificando, setVerificando] = useState(true);

  // O Supabase redireciona o usuário para esta página com um token na URL
  // O @supabase/ssr troca o token por sessão automaticamente
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessaoOk(true);
      }
      setVerificando(false);
    });
    // Verificar se já tem sessão ativa de recovery
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessaoOk(true);
      setVerificando(false);
    });
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (novaSenha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (novaSenha !== confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    if (error) {
      setErro("Não foi possível redefinir a senha. O link pode ter expirado. Solicite um novo.");
      setLoading(false);
      return;
    }

    setSucesso(true);
    setLoading(false);

    // Redirecionar após 3s para o login
    setTimeout(() => router.push("/auth/login"), 3000);
  }

  if (verificando) {
    return (
      <div className="w-full max-w-md flex items-center justify-center py-20">
        <span className="h-8 w-8 rounded-full border-2 border-jurua-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!sessaoOk) {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <Card>
          <CardBody className="text-center py-10">
            <span className="text-4xl block mb-3">⚠️</span>
            <h2 className="font-bold text-jurua-dark mb-2">Link inválido ou expirado</h2>
            <p className="text-sm text-muted mb-6">
              O link de redefinição de senha expirou ou já foi utilizado.
            </p>
            <Link href="/auth/forgot-password">
              <Button className="w-full">Solicitar novo link</Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="w-full max-w-md animate-fade-in">
        <Card>
          <CardBody className="text-center py-10">
            <span className="text-4xl block mb-3">✅</span>
            <h2 className="font-bold text-jurua-dark mb-2">Senha redefinida!</h2>
            <p className="text-sm text-muted">
              Sua senha foi atualizada com sucesso. Redirecionando para o login...
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-jurua-dark">Criar nova senha</h1>
        <p className="text-muted mt-1 text-sm">
          Digite e confirme sua nova senha de acesso
        </p>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <Input
              id="nova-senha"
              label="Nova senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
              autoComplete="new-password"
              error={
                novaSenha.length > 0 && novaSenha.length < 8
                  ? "Mínimo 8 caracteres"
                  : undefined
              }
            />
            <Input
              id="confirmar-senha"
              label="Confirmar nova senha"
              type="password"
              placeholder="Repita a senha"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
              autoComplete="new-password"
              error={
                confirmar.length > 0 && confirmar !== novaSenha
                  ? "As senhas não coincidem"
                  : undefined
              }
            />

            {erro && (
              <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              disabled={novaSenha.length < 8 || novaSenha !== confirmar}
            >
              Salvar nova senha
            </Button>
          </form>
        </CardBody>

        <CardFooter className="text-center">
          <Link href="/auth/login" className="text-sm text-jurua-accent hover:underline">
            ← Voltar ao login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
