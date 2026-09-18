import { isSameOrigin } from '@/lib/auth/origin';
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
const payload = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("start"),
    id: z.string().uuid(),
    module: z.string().max(100),
    mode: z.enum(["exploration", "practice", "exam"]),
    count: z.number().int().min(1).max(100),
  }),
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
  const { data, error } =
    body.action === "start"
      ? await supabase.rpc("start_training_attempt", {
          p_id: body.id,
          p_module: body.module,
          p_mode: body.mode,
          p_count: body.count,
        })
      : await supabase.rpc("finish_training_attempt", {
          p_id: body.id,
          p_answers: body.answers,
        });
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
