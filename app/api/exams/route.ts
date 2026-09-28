import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Sign in again" }, { status: 401 });
  const { data, error } = await supabase.rpc("available_training_exams");
  return Response.json(error ? { error: "Exams unavailable" } : data, {
    status: error ? 503 : 200,
    headers: { "Cache-Control": "private, no-store" },
  });
}
