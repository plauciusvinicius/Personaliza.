"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export function AlterarSenhaCard() {
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleAlterar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso(false);

    if (nova.length < 8) {
      setErro("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (nova !== confirmar) {
      setErro("A nova senha e a confirmação não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // Reautenticar com a senha atual antes de trocar
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setErro("Sessão inválida. Faça login novamente.");
      setLoading(false);
      return;
    }

    const { error: reAuthErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: atual,
    });

    if (reAuthErr) {
      setErro("Senha atual incorreta.");
      setLoading(false);
      return;
    }

    // Atualizar para a nova senha
    const { error: updateErr } = await supabase.auth.updateUser({ password: nova });

    if (updateErr) {
      setErro("Não foi possível atualizar a senha. Tente novamente.");
      setLoading(false);
      return;
    }

    setSucesso(true);
    setAtual("");
    setNova("");
    setConfirmar("");
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-jurua-dark">Alterar senha</h2>
        <p className="text-sm text-muted mt-1">
          Para alterar, informe sua senha atual e depois a nova senha
        </p>
      </CardHeader>
      <CardBody>
        {sucesso && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800 animate-fade-in">
            ✅ Senha alterada com sucesso!
          </div>
        )}
        <form onSubmit={handleAlterar} className="flex flex-col gap-4">
          <Input
            id="senha-atual"
            label="Senha atual"
            type="password"
            placeholder="Sua senha atual"
            value={atual}
            onChange={(e) => setAtual(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Input
            id="nova-senha"
            label="Nova senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={nova}
            onChange={(e) => setNova(e.target.value)}
            required
            autoComplete="new-password"
            error={
              nova.length > 0 && nova.length < 8
                ? "Mínimo 8 caracteres"
                : undefined
            }
          />
          <Input
            id="confirmar-nova-senha"
            label="Confirmar nova senha"
            type="password"
            placeholder="Repita a nova senha"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
            autoComplete="new-password"
            error={
              confirmar.length > 0 && confirmar !== nova
                ? "As senhas não coincidem"
                : undefined
            }
          />

          {erro && (
            <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button
              type="submit"
              loading={loading}
              disabled={!atual || nova.length < 8 || nova !== confirmar}
            >
              Salvar nova senha
            </Button>
            <p className="text-xs text-muted">
              Esqueceu?{" "}
              <a href="/auth/forgot-password" className="text-jurua-accent hover:underline">
                Redefinir por e-mail
              </a>
            </p>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
