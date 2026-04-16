import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DropzoneUploader } from "@/components/upload/DropzoneUploader";
import Link from "next/link";

export default function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-jurua-dark">Enviar PDFs</h1>
        <p className="text-muted text-sm mt-1">
          Envie um ou mais PDFs para gerar audiobook, vídeo e apresentação automaticamente
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-jurua-dark">Upload de arquivos</h2>
          <p className="text-sm text-muted mt-1">
            Cada PDF será processado individualmente e dividido em episódios de ~5 minutos
          </p>
        </CardHeader>
        <CardBody>
          <DropzoneUploader />
        </CardBody>
      </Card>

      {/* Informações */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        {[
          { icon: "⏱️", text: "Processamento em 7–10 min por PDF" },
          { icon: "📧", text: "Notificação por e-mail ao concluir" },
          { icon: "☁️", text: "Arquivos salvos no Google Drive" },
        ].map((item) => (
          <div key={item.text} className="rounded-xl border border-border bg-white p-4">
            <span className="text-2xl block mb-1">{item.icon}</span>
            <p className="text-xs text-muted">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link href="/professor/biblioteca" className="text-sm text-jurua-accent hover:underline">
          Ver biblioteca de livros →
        </Link>
      </div>
    </div>
  );
}
