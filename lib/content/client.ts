"use client";
import { useEffect, useState } from "react";
import type { Curriculum } from "./types";
export function useCurriculum() {
  const [data, setData] = useState<Curriculum>({
    releases: [],
    modules: [],
    courses: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/curriculum", { signal: controller.signal, cache: "no-store" })
      .then(async (r) => {
        if (!r.ok)
          throw Error("Programme indisponible / Curriculum unavailable");
        setData(await r.json());
        setLoading(false);
      })
      .catch((e) => {
        if (!controller.signal.aborted) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);
  return { data, error, loading };
}
