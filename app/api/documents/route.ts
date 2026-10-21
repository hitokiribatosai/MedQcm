import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSameOrigin } from "@/lib/auth/origin";
import { json, readJson } from "@/lib/http/response";
export async function GET() {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return json({ error: "Sign in again" }, 401);
  const { data, error } = await db.rpc("document_library");
  return error ? json({ error: "Documents unavailable" }, 503) : json(data);
}
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, 403);
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return json({ error: "Sign in again" }, 401);
  let body;
  try {
    body = z
      .object({ id: z.string().uuid() })
      .parse(await readJson(request, 1000));
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  const { data: path, error } = await db.rpc("document_download_path", {
    p_id: body.id,
  });
  if (error || !path) return json({ error: "Document access required" }, 403);
  const { data, error: signingError } = await db.storage
    .from("course-documents")
    .createSignedUrl(path, 60, { download: true });
  return signingError
    ? json({ error: "Download unavailable" }, 503)
    : json(data);
}
