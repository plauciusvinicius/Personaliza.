"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FileStatus = "pending" | "uploading" | "done" | "error";

interface FileEntry {
  file: File;
  status: FileStatus;
  error?: string;
}

interface DropzoneUploaderProps {
  onAllDone?: (results: { fileName: string; livroId: string }[]) => void;
}

export function DropzoneUploader({ onAllDone }: DropzoneUploaderProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [sending, setSending] = useState(false);
  const [allSent, setAllSent] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newEntries = accepted.map((f) => ({ file: f, status: "pending" as FileStatus }));
    setFiles((prev) => [...prev, ...newEntries]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.file.name !== name));
  }

  async function handleSend() {
    if (files.length === 0 || sending) return;
    setSending(true);
    const results: { fileName: string; livroId: string }[] = [];

    for (const entry of files) {
      if (entry.status === "done") continue;

      setFiles((prev) =>
        prev.map((f) => f.file.name === entry.file.name ? { ...f, status: "uploading" } : f)
      );

      try {
        const formData = new FormData();
        formData.append("file", entry.file);
        formData.append("titulo", entry.file.name.replace(".pdf", ""));

        const res = await fetch("/api/upload", { method: "POST", body: formData });

        if (!res.ok) throw new Error("Falha no envio");
        const json = await res.json();

        setFiles((prev) =>
          prev.map((f) => f.file.name === entry.file.name ? { ...f, status: "done" } : f)
        );
        results.push({ fileName: entry.file.name, livroId: json.livroId });
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.file.name === entry.file.name
              ? { ...f, status: "error", error: "Falha ao enviar. Tente novamente." }
              : f
          )
        );
      }
    }

    setSending(false);
    if (results.length > 0) {
      setAllSent(true);
      onAllDone?.(results);
    }
  }

  const hasPending = files.some((f) => f.status === "pending" || f.status === "error");

  return (
    <div className="flex flex-col gap-6">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-jurua-accent bg-jurua-pale"
            : "border-border bg-white hover:border-jurua-accent hover:bg-jurua-cream"
        }`}
      >
        <input {...getInputProps()} />
        <span className="text-5xl block mb-3">📄</span>
        <p className="text-lg font-semibold text-jurua-dark mb-1">
          {isDragActive ? "Solte os PDFs aqui..." : "Anexe seus PDFs aqui"}
        </p>
        <p className="text-sm text-muted mb-4">
          Arraste e solte ou clique para selecionar
        </p>
        <Button type="button" variant="secondary" size="sm">
          Selecionar arquivos
        </Button>
        <p className="text-xs text-muted mt-3">Apenas arquivos PDF</p>
      </div>

      {/* Lista de arquivos */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((entry) => (
            <div
              key={entry.file.name}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <StatusIcon status={entry.status} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-jurua-dark truncate">
                    {entry.file.name}
                  </p>
                  <p className="text-xs text-muted">{formatBytes(entry.file.size)}</p>
                  {entry.error && <p className="text-xs text-danger mt-0.5">{entry.error}</p>}
                </div>
              </div>
              {entry.status === "pending" || entry.status === "error" ? (
                <button
                  onClick={() => removeFile(entry.file.name)}
                  className="text-muted hover:text-danger transition-colors flex-shrink-0 text-lg leading-none"
                  title="Remover"
                >
                  ×
                </button>
              ) : entry.status === "done" ? (
                <span className="text-success text-sm font-medium flex-shrink-0">✓ Enviado</span>
              ) : (
                <span className="text-xs text-jurua-accent flex-shrink-0">Enviando...</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Botão enviar */}
      {hasPending && (
        <Button
          onClick={handleSend}
          loading={sending}
          variant="success"
          size="lg"
          className="w-full"
        >
          {sending ? "Enviando..." : `Enviar ${files.filter((f) => f.status !== "done").length} arquivo(s)`}
        </Button>
      )}

      {/* Confirmação */}
      {allSent && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-fade-in">
          <span className="text-4xl block mb-2">✅</span>
          <h3 className="font-bold text-green-800 mb-1">Envio concluído!</h3>
          <p className="text-sm text-green-700">
            Seus PDFs foram enviados e o processamento foi iniciado. Você receberá um e-mail
            quando o conteúdo estiver pronto.
          </p>
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: FileStatus }) {
  if (status === "done") return <span className="text-success text-xl flex-shrink-0">✅</span>;
  if (status === "error") return <span className="text-danger text-xl flex-shrink-0">❌</span>;
  if (status === "uploading") return (
    <span className="h-5 w-5 rounded-full border-2 border-jurua-accent border-t-transparent animate-spin flex-shrink-0" />
  );
  return <span className="text-xl flex-shrink-0">📄</span>;
}
