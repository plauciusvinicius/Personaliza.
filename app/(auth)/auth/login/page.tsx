"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error || !data.user) {
      setErro("E-mail ou senha inválidos.");
      setLoading(false);
      return;
    }

    // Buscar tipo de usuário
    const { data: profile } = await supabase
      .from("profiles")
      .select("tipo")
      .eq("id", data.user.id)
      .single();

    router.push(profile?.tipo === "professor" ? "/professor" : "/aluno");
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-jurua-dark">Entrar no portal</h1>
        <p className="text-muted mt-1 text-sm">
          Acesse com seu e-mail e senha cadastrados
        </p>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <Input
              id="email"
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <div>
              <Input
                id="senha"
                label="Senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                autoComplete="current-password"
              />
              <div className="mt-1.5 text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-jurua-accent hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            {erro && (
              <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Entrar
            </Button>
          </form>
        </CardBody>

        <CardFooter className="text-center">
          <p className="text-sm text-muted">
            Não tem conta?{" "}
            <Link href="/auth/register" className="text-jurua-accent font-medium hover:underline">
              Cadastre-se gratuitamente
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
