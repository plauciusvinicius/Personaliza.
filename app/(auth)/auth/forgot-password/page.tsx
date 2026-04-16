"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody, CardFooter } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setEnviado(true);
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-jurua-dark">Recuperar senha</h1>
        <p className="text-muted mt-1 text-sm">
          Enviaremos um link de redefinição para seu e-mail
        </p>
      </div>

      <Card>
        <CardBody>
          {enviado ? (
            <div className="text-center py-4">
              <span className="text-4xl block mb-3">📬</span>
              <h2 className="font-bold text-jurua-dark mb-2">E-mail enviado!</h2>
              <p className="text-sm text-muted">
                Verifique sua caixa de entrada (e o spam) para o link de redefinição.
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <Input
                id="email"
                label="E-mail cadastrado"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" loading={loading} className="w-full">
                Enviar link de recuperação
              </Button>
            </form>
          )}
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
