import { isSameOrigin } from "@/lib/auth/origin";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
const answerSchema = z.record(z.array(z.string().max(100)).max(20));
const payload = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("start"),
    id: z.string().uuid(),
    module: z.string().max(100),
    mode: z.enum(["exploration", "practice", "exam"]),
    sample: z.boolean().optional(),
    count: z.number().int().min(1).max(100),
  }),
  z.object({
    action: z.literal("save"),
    id: z.string().uuid(),
    answers: answerSchema,
    index: z.number().int().min(0).max(99),
    revision: z.number().int().min(0),
  }),
  z.object({ action: z.literal("abandon"), id: z.string().uuid() }),
  z.object({
    action: z.literal("finish"),
    id: z.string().uuid(),
    answers: z.record(z.array(z.string().max(100)).max(20)),
  }),
]);
export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return Response.json(
      { error: "Sign in again to continue." },
      { status: 401 },
    );
  const text = await request.text();
  if (text.length > 100000)
    return Response.json({ error: "Request too large" }, { status: 413 });
  let body;
  try {
    body = payload.parse(JSON.parse(text));
  } catch {
    return Response.json({ error: "Invalid quiz request" }, { status: 400 });
  }
  const args =
    body.action === "start"
      ? {
          p_id: body.id,
          p_module: body.module,
          p_mode: body.mode,
          p_count: body.count,
          p_sample: body.sample ?? false,
        }
      : body.action === "save"
        ? {
            p_id: body.id,
            p_answers: body.answers,
            p_index: body.index,
            p_revision: body.revision,
          }
        : body.action === "finish"
          ? { p_id: body.id, p_answers: body.answers }
          : { p_id: body.id };
  const name =
    body.action === "start"
      ? "start_training_attempt"
      : body.action === "save"
        ? "save_training_draft"
        : body.action === "finish"
          ? "finish_training_attempt"
          : "abandon_training_attempt";
  const { data, error } = await supabase.rpc(name, args);
  if (error)
    return Response.json(
      {
        error:
          "Quiz storage is unavailable or this session cannot be saved. Please retry. Your selections remain on this page.",
      },
      { status: 503 },
    );
  return Response.json(data, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Sign in again" }, { status: 401 });
  const url = new URL(request.url),
    id = url.searchParams.get("attempt");
  if (id) {
    if (!z.string().uuid().safeParse(id).success)
      return Response.json({ error: "Invalid attempt" }, { status: 400 });
    const { data, error } = await supabase.rpc("get_training_attempt", {
      p_id: id,
    });
    return Response.json(error ? { error: "Session unavailable" } : data, {
      status: error ? 404 : 200,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  const { data, error } = await supabase
    .from("training_attempts")
    .select("id,module_name,mode,started_at,deadline_at")
    .eq("user_id", user.id)
    .eq("module_id", url.searchParams.get("module") ?? "")
    .is("completed_at", null)
    .is("abandoned_at", null)
    .order("started_at", { ascending: false })
    .limit(10);
  return Response.json(error ? { error: "History unavailable" } : data, {
    status: error ? 503 : 200,
    headers: { "Cache-Control": "private, no-store" },
  });
}
