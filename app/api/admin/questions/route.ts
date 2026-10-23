// The previous editor mutated drafts without a publication lifecycle. Use the versioned workspace.
import { json } from "@/lib/http/response";
import { isSameOrigin } from "@/lib/auth/origin";
import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/auth/policy";
export async function GET() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!isStaff(user)) return json({ error: "Staff required" }, 403);
  return json({ error: "Use /api/admin/workspace?section=questions" }, 410);
}
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, 403);
  return GET();
}
