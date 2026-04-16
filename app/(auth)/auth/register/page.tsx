"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody, CardFooter } from "@/components/ui/card";

type Tipo = "professor" | "aluno";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get("tipo") as Tipo | null;

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState<Tipo>(tipoParam === "professor" ? "professor" : "aluno");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome, telefone, tipo },
      },
    });

    if (error || !data.user) {
      setErro(error?.message === "User already registered"
        ? "E-mail já cadastrado. Faça login."
        : "Erro ao criar conta. Tente novamente.");
      setLoading(false);
      return;
    }

    // Inserir profile
    await supabase.from("profiles").insert({
      id: data.user.id,
      email,
      nome,
      telefone: telefone || null,
      tipo,
      avatar_url: null,
    });

    router.push(tipo === "professor" ? "/professor" : "/aluno");
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-jurua-dark">Criar conta</h1>
        <p className="text-muted mt-1 text-sm">
          Cadastro gratuito — acesse todo o conteúdo
        </p>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {/* Tipo de conta */}
            <div>
              <label className="text-sm font-medium text-jurua-dark block mb-2">
                Tipo de conta
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["professor", "aluno"] as Tipo[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTipo(t)}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      tipo === t
                        ? "bg-jurua-primary text-white border-jurua-primary"
                        : "border-border text-muted hover:border-jurua-accent hover:text-jurua-dark"
                    }`}
                  >
                    {t === "professor" ? "🎓 Professor / Autor" : "📚 Aluno"}
                  </button>
                ))}
              </div>
            </div>

            <Input
              id="nome"
              label="Nome completo"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
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
            <Input
              id="telefone"
              label="Telefone (opcional)"
              type="tel"
              placeholder="(11) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
            <Input
              id="senha"
              label="Senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="new-password"
            />

            {erro && (
              <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {erro}
              </p>
            )}

            <Button type="submit" loading={loading} className="w-full mt-1">
              Criar conta
            </Button>
          </form>
        </CardBody>

        <CardFooter className="text-center">
          <p className="text-sm text-muted">
            Já tem conta?{" "}
            <Link href="/auth/login" className="text-jurua-accent font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md animate-pulse h-96 bg-white rounded-2xl" />}>
      <RegisterForm />
    </Suspense>
  );
}
