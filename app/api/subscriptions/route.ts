import { createClient } from "@/lib/supabase/server";
import { isSameOrigin } from "@/lib/auth/origin";
import { isAdmin } from "@/lib/auth/policy";
import { z } from "zod";
const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("submit"),
    id: z.string().uuid(),
    plan: z.enum(["annual", "semester"]),
    path: z.string().max(300),
    reference: z.string().trim().min(3).max(200),
    note: z.string().max(2000),
  }),
  z.object({
    action: z.literal("review"),
    id: z.string().uuid(),
    decision: z.enum(["approved", "rejected"]),
    note: z.string().max(2000),
  }),
  z.object({ action: z.literal("proof"), id: z.string().uuid() }),
]);
export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return Response.json({ error: "Forbidden" }, { status: 403 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Sign in again" }, { status: 401 });
  let body;
  try {
    const text = await request.text();
    if (text.length > 10000) throw Error();
    body = bodySchema.parse(JSON.parse(text));
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
  if (body.action === "review" && !isAdmin(user))
    return Response.json({ error: "Admin required" }, { status: 403 });
  if (body.action === "proof") {
    const { data: row } = await supabase
      .from("receipt_requests")
      .select("proof_path")
      .eq("id", body.id)
      .maybeSingle();
    if (!row) return Response.json({ error: "Unavailable" }, { status: 404 });
    const { data, error } = await supabase.storage
      .from("payment-receipts")
      .createSignedUrl(row.proof_path, 60);
    return Response.json(error ? { error: "Unavailable" } : data, {
      status: error ? 503 : 200,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  const { data, error } =
    body.action === "submit"
      ? await supabase.rpc("submit_receipt", {
          p_id: body.id,
          p_plan: body.plan,
          p_path: body.path,
          p_reference: body.reference,
          p_note: body.note,
        })
      : await supabase.rpc("review_receipt", {
          p_id: body.id,
          p_decision: body.decision,
          p_note: body.note,
        });
  return Response.json(
    error
      ? {
          error:
            "Unable to process this request. It may already be pending or reviewed, or payments are closed. Reload and retry.",
        }
      : data,
    {
      status: error ? 409 : 200,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Sign in again" }, { status: 401 });
  const [config, requests, entitlement] = await Promise.all([
    supabase.from("payment_configuration").select("*").eq("id", true).single(),
    isAdmin(user)
      ? supabase
          .from("receipt_requests")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: true })
          .limit(100)
      : supabase
          .from("receipt_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100),
    supabase
      .from("subscription_entitlements")
      .select("expires_at")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (config.error || requests.error || entitlement.error)
    return Response.json(
      { error: "Subscriptions unavailable" },
      { status: 503 },
    );
  return Response.json(
    {
      userId: user.id,
      admin: isAdmin(user),
      config: config.data,
      requests: requests.data,
      entitlement: entitlement.data,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
