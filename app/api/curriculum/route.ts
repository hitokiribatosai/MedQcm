import { createClient } from "@/lib/supabase/server";
import { json } from "@/lib/http/response";
export async function GET() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return json({ error: "Sign in again" }, 401);
  const { data, error } = await db.rpc("curriculum_overview");
  return error ? json({ error: "Curriculum unavailable" }, 503) : json(data);
}
