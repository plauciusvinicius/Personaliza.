"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

type Pergunta = {
  id: string;
  episodio_id: string;
  episodio_numero: number;
  pergunta: string;
  opcao_a: string;
  opcao_b: string;
  opcao_c: string;
  opcao_d: string;
  resposta_correta: "a" | "b" | "c" | "d";
};

export default function TesteFinalPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [livroId, setLivroId] = useState("");
  const [livroTitulo, setLivroTitulo] = useState("");
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<Record<string, "a" | "b" | "c" | "d">>({});
  const [submetido, setSubmetido] = useState(false);
  const [nota, setNota] = useState(0);
  const [certUrl, setCertUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadParams = useCallback(async () => {
    const resolved = await params;
    setLivroId(resolved.id);
  }, [params]);

  useEffect(() => { loadParams(); }, [loadParams]);

  useEffect(() => {
    if (!livroId) return;
    const supabase = createClient();

    async function fetchData() {
      const { data: livro } = await supabase
        .from("livros")
        .select("titulo")
        .eq("id", livroId)
        .single();
      setLivroTitulo(livro?.titulo ?? "");

      // Busca 2-3 perguntas por episódio
      const { data: eps } = await supabase
        .from("episodios")
        .select("id, numero")
        .eq("livro_id", livroId)
        .order("numero");

      const allPerguntas: Pergunta[] = [];
      for (const ep of eps ?? []) {
        const { data: qs } = await supabase
          .from("quiz_perguntas")
          .select("*")
          .eq("episodio_id", ep.id)
          .limit(3);
        (qs ?? []).forEach((q) => {
          allPerguntas.push({ ...q, episodio_numero: ep.numero });
        });
      }
      setPerguntas(allPerguntas);
      setLoading(false);
    }
    fetchData();
  }, [livroId]);

  async function handleSubmit() {
    if (Object.keys(respostas).length < perguntas.length) {
      alert("Responda todas as perguntas antes de enviar.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let acertos = 0;
    perguntas.forEach((p) => {
      if (respostas[p.id] === p.resposta_correta) acertos++;
    });

    const notaFinal = parseFloat(((acertos / perguntas.length) * 10).toFixed(1));
    const aprovado = notaFinal >= 7;

    // Gerar certificado via API se aprovado
    let certificadoUrl: string | null = null;
    if (aprovado) {
      const res = await fetch("/api/certificado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ livroId, nota: notaFinal }),
      });
      const json = await res.json();
      certificadoUrl = json.url ?? null;
    }

    // Atualizar progresso
    await supabase
      .from("progresso")
      .upsert({
        aluno_id: user!.id,
        livro_id: livroId,
        nota_final: notaFinal,
        aprovado,
        certificado_url: certificadoUrl,
      }, { onConflict: "aluno_id,livro_id" });

    setNota(notaFinal);
    setCertUrl(certificadoUrl);
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

  if (submetido) {
    const aprovado = nota >= 7;
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card>
          <CardBody className="text-center py-12">
            <span className="text-6xl block mb-4">{aprovado ? "🏆" : "📚"}</span>
            <h2 className="text-2xl font-bold text-jurua-dark mb-2">
              {aprovado ? "Aprovado!" : "Não aprovado"}
            </h2>
            <p className="text-muted mb-2">Nota final:</p>
            <p className={`text-5xl font-bold mb-6 ${aprovado ? "text-success" : "text-warning"}`}>
              {nota.toFixed(1)}
            </p>
            {aprovado ? (
              <>
                <p className="text-sm text-green-700 bg-green-50 rounded-lg px-4 py-3 mb-6">
                  Parabéns! Você concluiu o livro <strong>{livroTitulo}</strong> com sucesso.
                  Seu certificado foi emitido!
                </p>
                {certUrl && (
                  <a href={certUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="success" className="mb-3">
                      ⬇ Baixar Certificado
                    </Button>
                  </a>
                )}
              </>
            ) : (
              <p className="text-sm text-muted mb-6">
                A nota mínima para aprovação é 7,0. Revise o conteúdo e tente novamente.
              </p>
            )}
            <Button
              variant="secondary"
              onClick={() => router.push(`/aluno/livro/${livroId}`)}
            >
              Voltar ao livro
            </Button>
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
        <h1 className="text-xl font-bold text-jurua-dark">Teste Final</h1>
        <p className="text-muted text-sm mt-1">
          {livroTitulo} · {perguntas.length} questões · Nota mínima: 7,0
        </p>
        <div className="h-1.5 rounded-full bg-border mt-3 overflow-hidden">
          <div
            className="h-full bg-jurua-accent rounded-full transition-all"
            style={{ width: `${(Object.keys(respostas).length / Math.max(perguntas.length, 1)) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted mt-1">
          {Object.keys(respostas).length}/{perguntas.length} respondidas
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {perguntas.map((p, idx) => (
          <Card key={p.id}>
            <CardHeader>
              <p className="text-xs text-jurua-accent font-medium mb-1">
                Episódio {p.episodio_numero}
              </p>
              <p className="text-sm font-semibold text-jurua-dark">
                {idx + 1}. {p.pergunta}
              </p>
            </CardHeader>
            <CardBody className="flex flex-col gap-2">
              {(["a", "b", "c", "d"] as const).map((opcao) => (
                <button
                  key={opcao}
                  onClick={() => setRespostas((prev) => ({ ...prev, [p.id]: opcao }))}
                  className={`text-left rounded-lg border px-4 py-3 text-sm transition-all ${
                    respostas[p.id] === opcao
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
        ))}
      </div>

      <div className="mt-8 mb-12 text-center">
        <Button
          size="lg"
          onClick={handleSubmit}
          loading={saving}
          disabled={Object.keys(respostas).length < perguntas.length}
          className="w-full sm:w-auto"
        >
          Enviar teste final
        </Button>
      </div>
    </div>
  );
}
