import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-jurua-primary shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Image
            src="/logo-jurua.png"
            alt="Juruá Editora"
            width={120}
            height={48}
            className="object-contain brightness-0 invert"
            priority
          />
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                Entrar
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="bg-white text-jurua-primary hover:bg-jurua-pale">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-jurua-primary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            Portal Educacional
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Transforme livros em{" "}
            <span className="text-jurua-light">experiências de aprendizado</span>
          </h1>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Envie seus PDFs e receba automaticamente audiobooks, vídeos, apresentações e
            quizzes. Tudo no padrão acadêmico da Editora Juruá.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?tipo=professor">
              <Button size="lg" className="bg-white text-jurua-primary hover:bg-jurua-pale w-full sm:w-auto">
                Sou Professor / Autor
              </Button>
            </Link>
            <Link href="/auth/register?tipo=aluno">
              <Button
                size="lg"
                variant="ghost"
                className="border border-white/30 text-white hover:bg-white/10 w-full sm:w-auto"
              >
                Sou Aluno
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-jurua-dark mb-12">
            Do PDF ao conteúdo completo, automaticamente
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🎧",
                title: "Audiobook",
                desc: "Narração em PT-BR com voz masculina profissional, gerada automaticamente em MP3.",
              },
              {
                icon: "🎬",
                title: "Vídeo",
                desc: "Vídeo com imagens ilustrativas, narração e legenda. Pronto para YouTube.",
              },
              {
                icon: "📊",
                title: "Apresentação",
                desc: "Slides com os pontos principais do conteúdo, em formato para apresentação.",
              },
              {
                icon: "📝",
                title: "Quiz + Certificado",
                desc: "Questões automáticas por capítulo. Certificado emitido para nota ≥ 7,0.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-center text-center p-6 rounded-xl border border-border bg-jurua-cream"
              >
                <span className="text-4xl mb-4">{f.icon}</span>
                <h3 className="font-bold text-jurua-dark mb-2">{f.title}</h3>
                <p className="text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-jurua-pale">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-jurua-dark mb-4">
            Pronto para começar?
          </h2>
          <p className="text-muted mb-8">
            Crie sua conta gratuitamente e transforme seu primeiro PDF em conteúdo
            multimídia em minutos.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-jurua-primary text-white hover:bg-jurua-medium">
              Criar conta gratuita
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-jurua-dark text-white/60 py-8 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image
            src="/logo-jurua.png"
            alt="Juruá Editora"
            width={80}
            height={32}
            className="object-contain brightness-0 invert opacity-60"
          />
          <p className="text-sm text-center">
            © {new Date().getFullYear()} Editora Juruá. Portal Educacional.
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/auth/login" className="hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/auth/register" className="hover:text-white transition-colors">
              Cadastrar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
