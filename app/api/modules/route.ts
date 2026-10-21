import { createClient } from "@/lib/supabase/server";
import { json } from "@/lib/http/response";
import type { Curriculum } from "@/lib/content/types";
export async function GET() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return json({ error: "Sign in again" }, 401);
  const { data, error } = await db.rpc("curriculum_overview");
  return error
    ? json({ error: "Modules unavailable" }, 503)
    : json(
        (data as Curriculum).modules.map((m) => ({
          module_id: m.id,
          module_name: m.title,
          question_count: m.question_count,
          reviewed: m.reviewed,
        })),
      );
}
