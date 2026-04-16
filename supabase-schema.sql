-- ============================================================
-- Portal Editora Juruá — Schema Supabase
-- Execute no SQL Editor do Supabase (Settings > SQL Editor)
-- ============================================================

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES (complementa auth.users do Supabase)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  nome        TEXT NOT NULL,
  telefone    TEXT,
  tipo        TEXT NOT NULL CHECK (tipo IN ('professor', 'aluno')),
  avatar_url  TEXT,
  criado_em   TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- LIVROS (PDFs enviados pelos professores)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.livros (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo           TEXT NOT NULL,
  slug             TEXT NOT NULL,
  professor_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  drive_file_id    TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'processing', 'done', 'error')),
  total_episodios  INTEGER NOT NULL DEFAULT 0,
  descricao        TEXT,
  thumb_url        TEXT,
  criado_em        TIMESTAMPTZ DEFAULT now(),
  atualizado_em    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.livros ENABLE ROW LEVEL SECURITY;

-- Professor vê seus livros; alunos veem livros concluídos
CREATE POLICY "livros_professor_own" ON public.livros
  FOR ALL USING (
    auth.uid() = professor_id
    OR (status = 'done' AND EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo = 'aluno'
    ))
  );

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION public.update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER livros_atualizado_em
  BEFORE UPDATE ON public.livros
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

-- ============================================================
-- EPISÓDIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.episodios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livro_id      UUID NOT NULL REFERENCES public.livros(id) ON DELETE CASCADE,
  numero        INTEGER NOT NULL,
  titulo        TEXT NOT NULL,
  chars         INTEGER NOT NULL DEFAULT 0,
  audiobook_url TEXT,
  video_url     TEXT,
  slides_url    TEXT,
  thumb_url     TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'done', 'error')),
  criado_em     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.episodios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "episodios_select_all_authed" ON public.episodios
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "episodios_insert_service" ON public.episodios
  FOR INSERT WITH CHECK (true); -- N8N usa service_role key

CREATE POLICY "episodios_update_service" ON public.episodios
  FOR UPDATE USING (true); -- N8N usa service_role key

-- ============================================================
-- QUIZ — PERGUNTAS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_perguntas (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episodio_id      UUID NOT NULL REFERENCES public.episodios(id) ON DELETE CASCADE,
  pergunta         TEXT NOT NULL,
  opcao_a          TEXT NOT NULL,
  opcao_b          TEXT NOT NULL,
  opcao_c          TEXT NOT NULL,
  opcao_d          TEXT NOT NULL,
  resposta_correta TEXT NOT NULL CHECK (resposta_correta IN ('a', 'b', 'c', 'd')),
  criado_em        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quiz_perguntas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_perguntas_select_authed" ON public.quiz_perguntas
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "quiz_perguntas_insert_service" ON public.quiz_perguntas
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- QUIZ — RESPOSTAS DOS ALUNOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quiz_respostas (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  episodio_id   UUID NOT NULL REFERENCES public.episodios(id) ON DELETE CASCADE,
  pergunta_id   UUID NOT NULL REFERENCES public.quiz_perguntas(id) ON DELETE CASCADE,
  resposta_dada TEXT NOT NULL CHECK (resposta_dada IN ('a', 'b', 'c', 'd')),
  correta       BOOLEAN NOT NULL,
  respondido_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quiz_respostas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_respostas_own" ON public.quiz_respostas
  FOR ALL USING (auth.uid() = aluno_id);

-- ============================================================
-- PROGRESSO DOS ALUNOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.progresso (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id                UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  livro_id                UUID NOT NULL REFERENCES public.livros(id) ON DELETE CASCADE,
  episodios_completados   INTEGER[] NOT NULL DEFAULT '{}',
  nota_final              NUMERIC(4,1),
  aprovado                BOOLEAN NOT NULL DEFAULT false,
  certificado_url         TEXT,
  criado_em               TIMESTAMPTZ DEFAULT now(),
  atualizado_em           TIMESTAMPTZ DEFAULT now(),
  UNIQUE (aluno_id, livro_id)
);

ALTER TABLE public.progresso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progresso_own" ON public.progresso
  FOR ALL USING (auth.uid() = aluno_id);

CREATE TRIGGER progresso_atualizado_em
  BEFORE UPDATE ON public.progresso
  FOR EACH ROW EXECUTE FUNCTION public.update_atualizado_em();

-- ============================================================
-- LOG DE PROCESSAMENTO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.processamento_log (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livro_id  UUID REFERENCES public.livros(id) ON DELETE CASCADE,
  step      TEXT NOT NULL,
  status    TEXT NOT NULL CHECK (status IN ('started', 'ok', 'error')),
  mensagem  TEXT,
  criado_em TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.processamento_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "log_professor_own" ON public.processamento_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.livros l
      WHERE l.id = livro_id AND l.professor_id = auth.uid()
    )
  );

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_livros_professor ON public.livros(professor_id);
CREATE INDEX IF NOT EXISTS idx_livros_status ON public.livros(status);
CREATE INDEX IF NOT EXISTS idx_episodios_livro ON public.episodios(livro_id);
CREATE INDEX IF NOT EXISTS idx_quiz_episodio ON public.quiz_perguntas(episodio_id);
CREATE INDEX IF NOT EXISTS idx_progresso_aluno ON public.progresso(aluno_id);
CREATE INDEX IF NOT EXISTS idx_progresso_livro ON public.progresso(livro_id);
