"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DebugPage() {
  const [log, setLog] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const append = (msg: string) => setLog((p) => [...p, `${new Date().toISOString().slice(11, 23)} ${msg}`]);

  async function testSignup() {
    setLoading(true);
    setLog([]);
    append(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    append(`Key prefix: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 30)}...`);

    const supabase = createClient();
    append("Client created. Calling signUp...");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => { controller.abort(); append("TIMEOUT after 10s"); }, 10000);

      const { data, error } = await supabase.auth.signUp({
        email: `debug_${Date.now()}@test.com`,
        password: "Debug1234!",
        options: { data: { nome: "Debug", tipo: "professor" } },
      });

      clearTimeout(timeout);

      if (error) append(`ERROR: ${error.message} (${error.status})`);
      else append(`SUCCESS: user=${data.user?.id?.substring(0, 8)}...`);
    } catch (e: any) {
      append(`EXCEPTION: ${e.message}`);
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 24, fontFamily: "monospace" }}>
      <h2>Debug Supabase</h2>
      <button onClick={testSignup} disabled={loading} style={{ padding: "8px 16px", marginBottom: 16 }}>
        {loading ? "Testando..." : "Testar signUp"}
      </button>
      <pre style={{ background: "#111", color: "#0f0", padding: 16, borderRadius: 8, minHeight: 200 }}>
        {log.join("\n") || "Clique no botão para testar"}
      </pre>
    </div>
  );
}
