import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ set" : "❌ missing",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? `✅ ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
      : "❌ missing",
    serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ set" : "❌ missing",
    n8nWebhook: process.env.N8N_WEBHOOK_URL ? "✅ set" : "❌ missing",
  });
}
