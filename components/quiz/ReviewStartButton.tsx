"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function ReviewStartButton({
  locale,
  moduleId,
  count,
}: {
  locale: string;
  moduleId: string;
  count: number;
}) {
  const router = useRouter();
  const requestId = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const en = locale === "en";

  async function start() {
    if (busy) return;
    setBusy(true);
    setError("");
    requestId.current ??= crypto.randomUUID();
    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "startReview",
          id: requestId.current,
          module: moduleId,
          count: Math.min(count, 20),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      router.push(`/${locale}/quiz/${moduleId}?attempt=${data.id}`);
    } catch {
      setError(
        en
          ? "Could not start this review. Please try again."
          : "Impossible de commencer cette révision. Réessayez.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button className="btn-primary" disabled={busy} onClick={start}>
        {busy ? "…" : en ? "Review mistakes" : "Revoir mes erreurs"}
      </button>
      {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
