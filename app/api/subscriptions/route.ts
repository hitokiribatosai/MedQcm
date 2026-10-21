import { createClient } from "@/lib/supabase/server";
import { isSameOrigin } from "@/lib/auth/origin";
import { canManagePayments } from "@/lib/auth/policy";
import { json, readJson, databaseMessage } from "@/lib/http/response";
import { z } from "zod";
const schema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("submit"),
    id: z.string().uuid(),
    offer: z.string().uuid(),
    year: z.number().int().min(1).max(7).nullable(),
    module: z.string().max(100).nullable(),
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
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, 403);
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return json({ error: "Sign in again" }, 401);
  let b;
  try {
    b = schema.parse(await readJson(request, 10000));
  } catch {
    return json({ error: "Invalid request" }, 400);
  }
  if (b.action === "review" && !canManagePayments(user))
    return json({ error: "Payment manager required" }, 403);
  if (b.action === "proof") {
    const { data: r } = await db
      .from("receipt_requests")
      .select("proof_path")
      .eq("id", b.id)
      .maybeSingle();
    if (!r) return json({ error: "Unavailable" }, 404);
    const { data, error } = await db.storage
      .from("payment-receipts")
      .createSignedUrl(r.proof_path, 60, { download: true });
    return error ? json({ error: "Unavailable" }, 503) : json(data);
  }
  const { data, error } =
    b.action === "submit"
      ? await db.rpc("submit_scoped_receipt", {
          p_id: b.id,
          p_offer: b.offer,
          p_year: b.year,
          p_module: b.module,
          p_path: b.path,
          p_reference: b.reference,
          p_note: b.note,
        })
      : await db.rpc("review_receipt", {
          p_id: b.id,
          p_decision: b.decision,
          p_note: b.note,
        });
  return error ? json({ error: databaseMessage(error) }, 409) : json(data);
}
export async function GET(request: Request) {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return json({ error: "Sign in again" }, 401);
  const manager = canManagePayments(user),
    params = new URL(request.url).searchParams;
  const offset = z.coerce
    .number()
    .int()
    .min(0)
    .max(100000)
    .safeParse(params.get("offset") ?? 0);
  if (!offset.success) return json({ error: "Invalid offset" }, 400);
  let query = db
    .from("receipt_requests")
    .select("*")
    .order("created_at", { ascending: manager })
    .order("id")
    .range(offset.data, offset.data + 49);
  const status = params.get("status") || "pending";
  if (manager && ["pending", "approved", "rejected"].includes(status))
    query = query.eq("status", status);
  const [config, receipts, options, grants] = await Promise.all([
    db.from("payment_configuration").select("*").eq("id", true).single(),
    query,
    db.rpc("subscription_options"),
    manager
      ? db
          .from("access_grants")
          .select(
            "id,receipt_id,user_id,scope,study_year,module_id,starts_at,ends_at,revoked_at",
          )
          .order("created_at", { ascending: false })
          .range(offset.data, offset.data + 49)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (config.error || receipts.error || options.error || grants.error)
    return json({ error: "Subscriptions unavailable" }, 503);
  return json({
    userId: user.id,
    admin: manager,
    config: config.data,
    requests: receipts.data,
    ...options.data,
    managedGrants: grants.data,
  });
}
