"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  userRole?: "professor" | "aluno" | null;
  userName?: string | null;
}

export function Navbar({ userRole, userName }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuth = !!userRole;
  const perfilHref = userRole === "professor" ? "/professor/perfil" : "/aluno/perfil";

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    setDropdownOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const links =
    userRole === "professor"
      ? [
          { href: "/professor", label: "Dashboard" },
          { href: "/professor/upload", label: "Enviar PDFs" },
          { href: "/professor/biblioteca", label: "Minha Biblioteca" },
        ]
      : userRole === "aluno"
      ? [
          { href: "/aluno", label: "Início" },
          { href: "/aluno/biblioteca", label: "Biblioteca" },
          { href: "/aluno/certificados", label: "Certificados" },
        ]
      : [];

  return (
    <header className="sticky top-0 z-50 bg-jurua-primary shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href={isAuth ? (userRole === "professor" ? "/professor" : "/aluno") : "/"}>
          <Image
            src="/logo-jurua.png"
            alt="Juruá Editora"
            width={120}
            height={48}
            className="object-contain brightness-0 invert"
            priority
          />
        </Link>

        {/* Links de navegação */}
        {isAuth && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Área do usuário */}
        <div className="flex items-center gap-2">
          {isAuth ? (
            <div className="relative" ref={dropdownRef}>
              {/* Botão do avatar/nome */}
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {userName?.charAt(0).toUpperCase() ?? "U"}
                </div>
                <span className="text-sm text-white hidden sm:block max-w-[120px] truncate">
                  {userName?.split(" ")[0]}
                </span>
                <svg
                  className={`w-4 h-4 text-white/70 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-border overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-border bg-jurua-cream">
                    <p className="text-xs text-muted">Logado como</p>
                    <p className="text-sm font-semibold text-jurua-dark truncate">{userName}</p>
                    <p className="text-xs text-jurua-accent capitalize">{userRole}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href={perfilHref}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-jurua-dark hover:bg-jurua-cream transition-colors"
                    >
                      <span>👤</span>
                      Meu perfil
                    </Link>
                    <Link
                      href={perfilHref}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-jurua-dark hover:bg-jurua-cream transition-colors"
                    >
                      <span>🔑</span>
                      Alterar senha
                    </Link>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {loggingOut ? (
                        <span className="h-4 w-4 rounded-full border-2 border-danger border-t-transparent animate-spin" />
                      ) : (
                        <span>🚪</span>
                      )}
                      Sair da conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
