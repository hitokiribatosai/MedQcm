"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { SUBSCRIPTION_PRICING } from "@/lib/config/pricing";
type Receipt = {
  id: string;
  user_id: string;
  plan: string;
  amount: number;
  status: string;
  created_at: string;
  transaction_reference: string;
  note: string;
  admin_note: string;
};
type State = {
  userId: string;
  admin: boolean;
  config: {
    accepting_payments: boolean;
    instructions: string;
    annual_days: number;
    semester_days: number;
  };
  requests: Receipt[];
  entitlement: { expires_at: string } | null;
};
export default function SubscriptionPanel({
  admin = false,
}: {
  admin?: boolean;
}) {
  const en = useLocale() === "en";
  const [state, setState] = useState<State | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const [plan, setPlan] = useState<"annual" | "semester">("annual"),
    [reference, setReference] = useState(""),
    [note, setNote] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [reviewNote, setReviewNote] = useState("");
  const [hasUpload, setHasUpload] = useState(false);
  const form = useRef<HTMLFormElement | null>(null);
  const [proofLink, setProofLink] = useState<string | null>(null);
  const upload = useRef<{ id: string; path: string } | null>(null);
  async function load() {
    const response = await fetch("/api/subscriptions", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    setState(data);
  }
  useEffect(() => {
    let active = true;
    fetch("/api/subscriptions", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw Error(data.error);
        if (active) setState(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function action(body: object) {
    const response = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !state || !file) return;
    setBusy(true);
    setError("");
    try {
      if (
        !["image/jpeg", "image/png", "application/pdf"].includes(file.type) ||
        file.size > 5 * 1024 * 1024 ||
        !file.size
      )
        throw Error(
          en
            ? "Use a JPG, PNG or PDF up to 5 MB."
            : "Utilisez un JPG, PNG ou PDF de 5 Mo maximum.",
        );
      if (!upload.current) {
        const id = crypto.randomUUID(),
          extension =
            file.type === "application/pdf"
              ? "pdf"
              : file.type === "image/png"
                ? "png"
                : "jpg";
        const path = `${state.userId}/${id}/receipt.${extension}`;
        const { error } = await createClient()
          .storage.from("payment-receipts")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (error)
          throw Error(
            en ? "Receipt upload failed." : "Échec du téléversement du reçu.",
          );
        upload.current = { id, path };
        setHasUpload(true);
      }
      await action({
        action: "submit",
        ...upload.current,
        plan,
        reference,
        note,
      });
      upload.current = null;
      setHasUpload(false);
      setFile(null);
      setReference("");
      setNote("");
      form.current?.reset();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  async function review(receipt: Receipt, decision: "approved" | "rejected") {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await action({
        action: "review",
        id: receipt.id,
        decision,
        note: reviewNote,
      });
      setReviewNote("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  async function proof(id: string) {
    try {
      const data = await action({ action: "proof", id });
      setProofLink(data.signedUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }
  if (!state)
    return (
      <section className="card p-6">
        <p role={error ? "alert" : "status"}>
          {error || (en ? "Loading…" : "Chargement…")}
        </p>
        <button onClick={() => load().catch((e) => setError(e.message))}>
          {en ? "Retry" : "Réessayer"}
        </button>
      </section>
    );
  const closed =
    !state.config.accepting_payments || !state.config.instructions.trim();
  return (
    <section className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">
        {admin
          ? en
            ? "Payment review"
            : "Validation des paiements"
          : en
            ? "Subscriptions"
            : "Abonnements"}
      </h1>
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}
      {proofLink && (
        <p>
          <a
            className="underline"
            href={proofLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {en
              ? "Open receipt (link expires in 60 seconds)"
              : "Ouvrir le reçu (lien valable 60 secondes)"}
          </a>
        </p>
      )}
      {!admin && (
        <>
          {closed ? (
            <p className="card p-6 border-2 border-amber-300">
              {en
                ? "Payments are closed. Do not transfer money. Recipient details and plan durations still need confirmation."
                : "Les paiements sont fermés. N’effectuez aucun transfert. Les coordonnées et les durées des offres restent à confirmer."}
            </p>
          ) : (
            <p className="card p-6 whitespace-pre-wrap">
              {state.config.instructions}
            </p>
          )}
          {state.entitlement && (
            <p>
              {en ? "Subscription expires" : "Expiration de l’abonnement"}:{" "}
              {new Date(state.entitlement.expires_at).toLocaleString()}
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.values(SUBSCRIPTION_PRICING).map((p) => (
              <article key={p.id} className="card p-5">
                <h2>{p.name}</h2>
                <strong className="text-2xl">{p.formattedPrice}</strong>
                <p>
                  {closed
                    ? en
                      ? "Planned offer"
                      : "Offre prévue"
                    : `${p.id === "annual" ? state.config.annual_days : state.config.semester_days} ${en ? "days" : "jours"}`}
                </p>
              </article>
            ))}
          </div>
          {!closed && (
            <form ref={form} onSubmit={submit} className="card p-6 space-y-4">
              <fieldset
                disabled={
                  busy ||
                  hasUpload ||
                  state.requests.some((r) => r.status === "pending")
                }
                className="space-y-4"
              >
                <label className="block">
                  {en ? "Plan" : "Offre"}
                  <select
                    className="input"
                    value={plan}
                    onChange={(e) =>
                      setPlan(e.target.value as "annual" | "semester")
                    }
                  >
                    <option value="annual">4 500 DA</option>
                    <option value="semester">2 800 DA</option>
                  </select>
                </label>
                <label className="block">
                  {en ? "Transaction reference" : "Référence de transaction"}
                  <input
                    className="input"
                    required
                    minLength={3}
                    maxLength={200}
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </label>
                <label className="block">
                  {en
                    ? "Receipt (JPG, PNG, PDF; 5 MB)"
                    : "Reçu (JPG, PNG, PDF ; 5 Mo)"}
                  <input
                    type="file"
                    required={!file}
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <label className="block">
                  {en ? "Note" : "Remarque"}
                  <textarea
                    className="input"
                    maxLength={2000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </label>
              </fieldset>
              <button
                className="btn-primary"
                disabled={
                  busy || state.requests.some((r) => r.status === "pending")
                }
              >
                {busy
                  ? "…"
                  : hasUpload
                    ? en
                      ? "Retry request"
                      : "Réessayer la demande"
                    : en
                      ? "Submit receipt"
                      : "Envoyer le reçu"}
              </button>
            </form>
          )}
        </>
      )}
      {admin && (
        <label className="block">
          {en ? "Review note" : "Note de validation"}
          <textarea
            className="input"
            maxLength={2000}
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
          />
        </label>
      )}
      <h2 className="text-xl font-bold">
        {admin
          ? en
            ? "Pending requests (oldest 100)"
            : "Demandes en attente (100 plus anciennes)"
          : en
            ? "Recent requests"
            : "Demandes récentes"}
      </h2>
      {!state.requests.length && (
        <p>{en ? "No requests yet." : "Aucune demande."}</p>
      )}
      <ul className="space-y-4">
        {state.requests.map((r) => (
          <li key={r.id} className="card p-5 space-y-2">
            <p>
              {r.plan} · {r.amount} DA · {r.status}
            </p>
            <p>
              {r.transaction_reference} ·{" "}
              {new Date(r.created_at).toLocaleString()}
            </p>
            {admin && (
              <p className="break-all">
                {en ? "Account" : "Compte"}: {r.user_id}
              </p>
            )}
            <p>{r.note}</p>
            {r.admin_note && <p>{r.admin_note}</p>}
            <button className="btn-secondary" onClick={() => proof(r.id)}>
              {en ? "View private receipt" : "Voir le reçu privé"}
            </button>
            {admin && r.status === "pending" && (
              <div className="flex gap-3">
                <button
                  className="btn-primary"
                  disabled={busy}
                  onClick={() => review(r, "approved")}
                >
                  {en ? "Approve" : "Approuver"}
                </button>
                <button
                  className="btn-secondary"
                  disabled={busy}
                  onClick={() => review(r, "rejected")}
                >
                  {en ? "Reject" : "Refuser"}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
