"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useCurriculum } from "@/lib/content/client";
import type { Offer, Grant } from "@/lib/content/types";
type Coverage = {
  scope: string;
  study_year: number | null;
  module_id: string | null;
  offer_title: string;
  starts_at: string;
  ends_at: string;
  terms: string;
};
type Receipt = {
  id: string;
  plan: string;
  amount: number;
  status: string;
  coverage: Coverage | null;
  transaction_reference: string;
  note: string;
  admin_note: string;
  created_at: string;
};
type State = {
  userId: string;
  admin: boolean;
  config: { accepting_payments: boolean; instructions: string };
  requests: Receipt[];
  offers: Offer[];
  grants: Grant[];
  managedGrants: Grant[];
};
export default function SubscriptionPanel({
  admin = false,
}: {
  admin?: boolean;
}) {
  const en = useLocale() === "en";
  const { data: curriculum } = useCurriculum();
  const [state, setState] = useState<State | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [offset, setOffset] = useState(0),
    [status, setStatus] = useState("pending");
  const [offerId, setOfferId] = useState(""),
    [year, setYear] = useState(""),
    [moduleId, setModuleId] = useState(""),
    [reference, setReference] = useState(""),
    [note, setNote] = useState(""),
    [reviewNote, setReviewNote] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [proof, setProof] = useState("");
  const [hasUpload, setHasUpload] = useState(false);
  const uploaded = useRef<{ id: string; path: string } | null>(null);
  const offer = state?.offers.find((o) => o.id === offerId && o.active);
  const load = useCallback(async () => {
    const r = await fetch(
      `/api/subscriptions?offset=${offset}&status=${status}`,
      { cache: "no-store" },
    );
    const d = await r.json();
    if (!r.ok) throw Error(d.error);
    setState(d);
  }, [offset, status]);
  useEffect(() => {
    let active = true;
    fetch(`/api/subscriptions?offset=${offset}&status=${status}`, {
      cache: "no-store",
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        if (active) setState(d);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [offset, status]);
  async function action(body: object) {
    const r = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!r.ok) throw Error(d.error);
    return d;
  }
  async function run(work: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await work();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }
  if (!state)
    return (
      <section className="card p-5">
        <p role={error ? "alert" : "status"}>
          {error || (en ? "Loading…" : "Chargement…")}
        </p>
        <button className="btn-secondary" onClick={() => void run(load)}>
          {en ? "Retry" : "Réessayer"}
        </button>
      </section>
    );
  const closed =
    !state.config.accepting_payments || !state.config.instructions.trim();
  const coverage = (c: {
    scope: string;
    study_year: number | null;
    module_id: string | null;
  }) =>
    c.scope === "year"
      ? `${en ? "Year" : "Année"} ${c.study_year}`
      : c.scope === "all_years"
        ? en
          ? "Medicine years 1–7"
          : "Médecine années 1–7"
        : c.scope === "module"
          ? curriculum.modules.find((m) => m.id === c.module_id)?.title ||
            c.module_id
          : c.scope === "residency"
            ? "Résidanat"
            : en
              ? "Previous subscription"
              : "Ancien abonnement";
  return (
    <section className="space-y-6 max-w-5xl">
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
        <p role="alert" className="card p-4 text-red-700">
          {error}
        </p>
      )}
      {!admin && (
        <>
          {closed ? (
            <p className="card p-5 border-amber-500">
              {en
                ? "Payments are closed. Do not transfer money."
                : "Les paiements sont fermés. N’effectuez aucun transfert."}
            </p>
          ) : (
            <p className="card p-5 whitespace-pre-wrap">
              {state.config.instructions}
            </p>
          )}
          <h2 className="text-xl font-bold">
            {en ? "Your access" : "Vos accès"}
          </h2>
          {!state.grants.length && (
            <p>
              {en
                ? "No purchased access yet. Free sample modules remain available."
                : "Aucun accès acheté. Les modules exemples gratuits restent disponibles."}
            </p>
          )}
          {state.grants.map((g) => (
            <article className="card p-4" key={g.id}>
              <strong>{coverage(g)}</strong>
              <p>
                {new Date(g.starts_at).toLocaleDateString()} →{" "}
                {new Date(g.ends_at).toLocaleDateString()}
                {g.revoked_at
                  ? ` · ${en ? "Revoked" : "Révoqué"}`
                  : new Date(g.ends_at) <= new Date()
                    ? ` · ${en ? "Expired" : "Expiré"}`
                    : new Date(g.starts_at) > new Date()
                      ? ` · ${en ? "Starts later" : "À venir"}`
                      : ""}
              </p>
            </article>
          ))}
          <div className="grid sm:grid-cols-2 gap-4">
            {state.offers
              .filter((o) => o.active)
              .map((o) => (
                <article className="card p-5 space-y-2" key={o.id}>
                  <h2 className="font-bold">{o.title}</h2>
                  <strong>{o.amount} DA</strong>
                  <p>
                    {new Date(o.starts_at).toLocaleDateString()} →{" "}
                    {new Date(o.ends_at).toLocaleDateString()}
                  </p>
                  <p>{o.terms}</p>
                </article>
              ))}
          </div>
          {!state.offers.some((o) => o.active) && (
            <p>
              {en
                ? "Offers are being prepared."
                : "Les offres sont en préparation."}
            </p>
          )}
          {!closed && (
            <form
              className="card p-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  if (!offer || !file)
                    throw Error(
                      en
                        ? "Choose an offer and receipt."
                        : "Choisissez une offre et un reçu.",
                    );
                  if (
                    !["image/jpeg", "image/png", "application/pdf"].includes(
                      file.type,
                    ) ||
                    !file.size ||
                    file.size > 5242880
                  )
                    throw Error("JPG / PNG / PDF, 5 Mo maximum");
                  if (!uploaded.current) {
                    const id = crypto.randomUUID(),
                      ext =
                        file.type === "application/pdf"
                          ? "pdf"
                          : file.type === "image/png"
                            ? "png"
                            : "jpg",
                      path = `${state.userId}/${id}/receipt.${ext}`;
                    const { error } = await createClient()
                      .storage.from("payment-receipts")
                      .upload(path, file, {
                        upsert: false,
                        contentType: file.type,
                      });
                    if (error)
                      throw Error(
                        en
                          ? "Receipt upload failed."
                          : "Échec du dépôt du reçu.",
                      );
                    uploaded.current = { id, path };
                    setHasUpload(true);
                  }
                  await action({
                    action: "submit",
                    ...uploaded.current,
                    offer: offer.id,
                    year: offer.scope === "year" ? Number(year) : null,
                    module: offer.scope === "module" ? moduleId : null,
                    reference,
                    note,
                  });
                  uploaded.current = null;
                  setHasUpload(false);
                  setFile(null);
                  setReference("");
                  setNote("");
                });
              }}
            >
              <fieldset disabled={busy} className="space-y-3">
                <label className="block">
                  {en ? "Offer" : "Offre"}
                  <select
                    className="input block w-full"
                    required
                    value={offerId}
                    onChange={(e) => {
                      setOfferId(e.target.value);
                      setYear("");
                      setModuleId("");
                    }}
                  >
                    <option value="">—</option>
                    {state.offers
                      .filter((o) => o.active)
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.title} · {o.amount} DA
                        </option>
                      ))}
                  </select>
                </label>
                {offer?.scope === "year" && (
                  <label className="block">
                    {en ? "Year to unlock" : "Année à débloquer"}
                    <select
                      className="input block"
                      value={year}
                      required
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option value="">—</option>
                      {[
                        ...new Set(
                          curriculum.modules
                            .filter(
                              (m) =>
                                m.release_id === offer.release_id &&
                                m.study_year <= 7,
                            )
                            .map((m) => m.study_year),
                        ),
                      ]
                        .sort((a, b) => a - b)
                        .map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
                {offer?.scope === "module" && (
                  <label className="block">
                    Module
                    <select
                      className="input block"
                      value={moduleId}
                      required
                      onChange={(e) => setModuleId(e.target.value)}
                    >
                      <option value="">—</option>
                      {curriculum.modules
                        .filter((m) => m.release_id === offer.release_id)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.study_year} · {m.title}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
                {offer && (
                  <p>
                    {offer.amount} DA ·{" "}
                    {new Date(offer.starts_at).toLocaleDateString()} →{" "}
                    {new Date(offer.ends_at).toLocaleDateString()} ·{" "}
                    {en
                      ? "Changing your profile year does not change purchased access."
                      : "Modifier votre année de profil ne modifie pas les accès achetés."}
                  </p>
                )}
                <label className="block">
                  {en
                    ? "Receipt (JPG, PNG, PDF; 5 MB)"
                    : "Reçu (JPG, PNG, PDF ; 5 Mo)"}
                  <input
                    className="input block"
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    required
                    disabled={hasUpload}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
                <label className="block">
                  {en ? "Transaction reference" : "Référence de transaction"}
                  <input
                    className="input block w-full"
                    required
                    minLength={3}
                    maxLength={200}
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </label>
                <label className="block">
                  Note
                  <textarea
                    className="input block w-full"
                    maxLength={2000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </label>
                <button className="btn-primary">
                  {en
                    ? "Submit for manual verification"
                    : "Soumettre pour vérification manuelle"}
                </button>
              </fieldset>
            </form>
          )}
        </>
      )}
      {admin && (
        <>
          <label className="block">
            {en ? "Request status" : "État des demandes"}
            <select
              className="input block"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setOffset(0);
              }}
            >
              <option value="pending">{en ? "Pending" : "En attente"}</option>
              <option value="approved">{en ? "Approved" : "Approuvées"}</option>
              <option value="rejected">{en ? "Rejected" : "Rejetées"}</option>
            </select>
          </label>
          <label className="block">
            {en ? "Review note" : "Note de vérification"}
            <textarea
              className="input block w-full"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              maxLength={2000}
            />
          </label>
        </>
      )}
      {proof && (
        <p>
          <a
            className="underline"
            href={proof}
            target="_blank"
            rel="noopener noreferrer"
          >
            {en
              ? "Download receipt (60-second link)"
              : "Télécharger le reçu (lien de 60 secondes)"}
          </a>
        </p>
      )}
      <h2 className="text-xl font-bold">
        {en ? "Payment requests" : "Demandes de paiement"}
      </h2>
      {!state.requests.length && (
        <p>{en ? "No requests." : "Aucune demande."}</p>
      )}
      {state.requests.map((r) => (
        <article className="card p-4 space-y-2" key={r.id}>
          <strong>
            {r.coverage?.offer_title || r.plan} · {r.amount} DA · {r.status}
          </strong>
          {r.coverage && (
            <>
              <p>
                {coverage(r.coverage)} ·{" "}
                {new Date(r.coverage.ends_at).toLocaleDateString()}
              </p>
              <p>{r.coverage.terms}</p>
            </>
          )}
          <p>
            {r.transaction_reference} · {r.note}
          </p>
          <p>{r.admin_note}</p>
          <button
            className="btn-secondary"
            disabled={busy}
            onClick={() =>
              void run(async () =>
                setProof(
                  (await action({ action: "proof", id: r.id })).signedUrl,
                ),
              )
            }
          >
            {en ? "View receipt" : "Voir le reçu"}
          </button>
          {admin && r.status === "pending" && (
            <div className="flex gap-3">
              {(["approved", "rejected"] as const).map((decision) => (
                <button
                  key={decision}
                  className="btn-secondary"
                  disabled={busy}
                  onClick={() =>
                    void run(async () => {
                      await action({
                        action: "review",
                        id: r.id,
                        decision,
                        note: reviewNote,
                      });
                    })
                  }
                >
                  {decision === "approved"
                    ? en
                      ? "Approve access"
                      : "Approuver l’accès"
                    : en
                      ? "Reject"
                      : "Rejeter"}
                </button>
              ))}
            </div>
          )}
        </article>
      ))}
      <nav className="flex gap-4">
        <button
          className="btn-secondary"
          disabled={offset === 0 || busy}
          onClick={() => setOffset(Math.max(0, offset - 50))}
        >
          {en ? "Previous" : "Précédent"}
        </button>
        <button
          className="btn-secondary"
          disabled={state.requests.length < 50 || busy}
          onClick={() => setOffset(offset + 50)}
        >
          {en ? "Next" : "Suivant"}
        </button>
      </nav>
      {admin && state.managedGrants.length > 0 && (
        <details>
          <summary>
            {en
              ? "Recent access grant IDs (for revocation)"
              : "Identifiants des droits récents (pour révocation)"}
          </summary>
          {state.managedGrants.map((g) => (
            <p className="break-all text-sm" key={g.id}>
              {g.id} · {coverage(g)} · {g.ends_at}
            </p>
          ))}
        </details>
      )}
    </section>
  );
}
