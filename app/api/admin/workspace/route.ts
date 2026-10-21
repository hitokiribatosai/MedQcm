import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/auth/policy";
import { isSameOrigin } from "@/lib/auth/origin";
import { databaseMessage, json, readJson } from "@/lib/http/response";
const schema = z.object({
  domain: z.enum(["curriculum", "question", "exam", "offer", "document"]),
  action: z.string().min(1).max(40),
  data: z.record(z.unknown()),
});
export async function GET(request: Request) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!isStaff(user)) return json({ error: "Staff required" }, 403);
  const params = new URL(request.url).searchParams;
  const offset = z.coerce
    .number()
    .int()
    .min(0)
    .max(100000)
    .safeParse(params.get("offset") ?? 0);
  if (!offset.success) return json({ error: "Invalid offset" }, 400);
  const { data, error } = await db.rpc("admin_workspace", {
    p_section: params.get("section") ?? "questions",
    p_offset: offset.data,
  });
  return error
    ? json(
        { error: databaseMessage(error) },
        error.code === "P0001" ? 403 : 503,
      )
    : json(data);
}
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, 403);
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!isStaff(user)) return json({ error: "Staff required" }, 403);
  let body;
  try {
    body = schema.parse(await readJson(request));
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  const { data, error } = await db.rpc(`manage_${body.domain}`, {
    p_action: body.action,
    p_data: body.data,
  });
  return error
    ? json(
        { error: databaseMessage(error) },
        error.code === "P0001" ? 409 : 503,
      )
    : json(data);
}
