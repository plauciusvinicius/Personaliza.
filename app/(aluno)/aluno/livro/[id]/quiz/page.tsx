"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type Pergunta = {
  id: string;
  pergunta: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c: string;
  opcao_d: string;
  resposta_correta: "a" | "b" | "c" | "d";
};

type Resposta = { perguntaId: string; escolha: "a" | "b" | "c" | "d" };

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const episodioId = searchParams.get("ep");

  const [livroId, setLivroId] = useState<string>("");
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [submetido, setSubmetido] = useState(false);
  const [nota, setNota] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [epNumero, setEpNumero] = useState<number>(1);

  const loadParams = useCallback(async () => {
    const resolved = await params;
    setLivroId(resolved.id);
  }, [params]);

  useEffect(() => {
    loadParams();
  }, [loadParams]);

  useEffect(() => {
    if (!episodioId) return;
    const supabase = createClient();

    async function fetchData() {
      const { data: ep } = await supabase
        .from("episodios")
        .select("numero")
        .eq("id", episodioId)
        .single();
      setEpNumero(ep?.numero ?? 1);

      const { data } = await supabase
        .from("quiz_perguntas")
        .select("*")
        .eq("episodio_id", episodioId);
      setPerguntas(data ?? []);
      setLoading(false);
    }
    fetchData();
  }, [episodioId]);

  function selecionar(perguntaId: string, escolha: "a" | "b" | "c" | "d") {
    setRespostas((prev) => {
      const existing = prev.findIndex((r) => r.perguntaId === perguntaId);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = { perguntaId, escolha };
        return copy;
      }
      return [...prev, { perguntaId, escolha }];
    });
  }

  async function handleSubmit() {
    if (respostas.length < perguntas.length) {
      alert("Responda todas as perguntas antes de enviar.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let acertos = 0;
    const inserts = respostas.map((r) => {
      const pergunta = perguntas.find((p) => p.id === r.perguntaId)!;
      const correta = r.escolha === pergunta.resposta_correta;
      if (correta) acertos++;
      return {
        aluno_id: user!.id,
        episodio_id: episodioId!,
        pergunta_id: r.perguntaId,
        resposta_dada: r.escolha,
        correta,
      };
    });

    await supabase.from("quiz_respostas").insert(inserts);

    // Marcar episódio como completo no progresso
    const { data: prog } = await supabase
      .from("progresso")
      .select("id, episodios_completados")
      .eq("aluno_id", user!.id)
      .eq("livro_id", livroId)
      .single();

    const completados = prog?.episodios_completados ?? [];
    if (!completados.includes(epNumero)) {
      if (prog) {
        await supabase
          .from("progresso")
          .update({ episodios_completados: [...completados, epNumero] })
          .eq("id", prog.id);
      } else {
        await supabase.from("progresso").insert({
          aluno_id: user!.id,
          livro_id: livroId,
          episodios_completados: [epNumero],
          aprovado: false,
        });
      }
    }

    const notaFinal = (acertos / perguntas.length) * 10;
    setNota(notaFinal);
    setSubmetido(true);
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="h-8 w-8 rounded-full border-2 border-jurua-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (perguntas.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <span className="text-5xl block mb-3">⚙️</span>
        <p className="text-jurua-dark font-medium">Quiz ainda em geração...</p>
        <p className="text-muted text-sm mt-2">Volte em alguns minutos</p>
        <Button className="mt-6" onClick={() => router.back()} variant="secondary">
          Voltar
        </Button>
      </div>
    );
  }

  if (submetido) {
    const aprovado = nota >= 7;
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card>
          <CardBody className="text-center py-12">
            <span className="text-6xl block mb-4">{aprovado ? "🎉" : "📚"}</span>
            <h2 className="text-2xl font-bold text-jurua-dark mb-2">
              {aprovado ? "Parabéns!" : "Continue estudando"}
            </h2>
            <p className="text-muted mb-6">
              Sua nota: <strong className={`text-2xl ${aprovado ? "text-success" : "text-warning"}`}>
                {nota.toFixed(1)}
              </strong>
            </p>
            {!aprovado && (
              <p className="text-sm text-muted mb-6">
                Para receber o certificado, é necessário nota ≥ 7,0 no teste final.
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push(`/aluno/livro/${livroId}`)} variant="secondary">
                Voltar ao livro
              </Button>
              {aprovado && (
                <Button onClick={() => router.push(`/aluno/livro/${livroId}/teste-final`)}>
                  Fazer teste final
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
          ← Voltar
        </Button>
        <h1 className="text-xl font-bold text-jurua-dark">Quiz — Episódio {epNumero}</h1>
        <p className="text-muted text-sm mt-1">
          {respostas.length}/{perguntas.length} respondidas
        </p>
        <div className="h-1.5 rounded-full bg-border mt-3 overflow-hidden">
          <div
            className="h-full bg-jurua-accent rounded-full transition-all"
            style={{ width: `${(respostas.length / perguntas.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {perguntas.map((p, idx) => {
          const respostaAtual = respostas.find((r) => r.perguntaId === p.id)?.escolha;
          return (
            <Card key={p.id}>
              <CardHeader>
                <p className="text-sm font-semibold text-jurua-dark">
                  {idx + 1}. {p.pergunta}
                </p>
              </CardHeader>
              <CardBody className="flex flex-col gap-2">
                {(["a", "b", "c", "d"] as const).map((opcao) => (
                  <button
                    key={opcao}
                    onClick={() => selecionar(p.id, opcao)}
                    className={`text-left rounded-lg border px-4 py-3 text-sm transition-all ${
                      respostaAtual === opcao
                        ? "border-jurua-accent bg-jurua-pale text-jurua-dark font-medium"
                        : "border-border hover:border-jurua-accent hover:bg-jurua-cream text-muted"
                    }`}
                  >
                    <span className="font-semibold uppercase mr-2">{opcao})</span>
                    {p[`opcao_${opcao}` as keyof Pergunta] as string}
                  </button>
                ))}
              </CardBody>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Button
          size="lg"
          onClick={handleSubmit}
          loading={saving}
          disabled={respostas.length < perguntas.length}
          className="w-full sm:w-auto"
        >
          Enviar respostas
        </Button>
      </div>
    </div>
  );
}
