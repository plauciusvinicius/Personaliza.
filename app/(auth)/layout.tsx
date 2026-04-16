import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-jurua-cream flex flex-col">
      {/* Topo */}
      <header className="bg-jurua-primary shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          <Link href="/">
            <Image
              src="/logo-jurua.png"
              alt="Juruá Editora"
              width={100}
              height={40}
              className="object-contain brightness-0 invert"
            />
          </Link>
        </div>
      </header>

      {/* Conteúdo centrado */}
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        {children}
      </main>

      {/* Footer simples */}
      <footer className="bg-jurua-dark text-white/50 py-4 text-center text-xs">
        © {new Date().getFullYear()} Editora Juruá
      </footer>
    </div>
  );
}
