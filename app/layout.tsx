import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Juruá Editora — Portal Educacional",
  description: "Portal de conteúdo educacional da Editora Juruá. Acesse audiobooks, vídeos, apresentações e certificados.",
  openGraph: {
    title: "Juruá Editora — Portal Educacional",
    description: "Portal de conteúdo educacional da Editora Juruá",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col bg-jurua-cream text-foreground">
        {children}
      </body>
    </html>
  );
}
