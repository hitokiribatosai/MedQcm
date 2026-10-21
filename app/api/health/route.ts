import { createClient } from "@supabase/supabase-js";
const requiredSchema = "202610200003";
export async function GET() {
  try {
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          fetch: (input, init) =>
            fetch(input, { ...init, signal: AbortSignal.timeout(4000) }),
        },
      },
    );
    const { data, error } = await db.rpc("schema_health");
    const ready = !error && data === requiredSchema;
    return Response.json(
      {
        status: ready ? "ok" : "unavailable",
        release: process.env.NEXT_PUBLIC_RELEASE_SHA || "development",
        schemaRequired: requiredSchema,
      },
      { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { status: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
