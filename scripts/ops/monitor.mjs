// Run from a trusted scheduler. Nonzero exit status integrates with the scheduler's alerts.
const urls = (process.env.MONITOR_URLS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
if (!urls.length)
  throw Error("Set MONITOR_URLS to the deployed website origins");
let failed = false;
for (const origin of urls) {
  const url = new URL("/api/health", origin);
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await r.json();
    if (!r.ok || data.status !== "ok") throw Error("Health failed");
    console.log(
      JSON.stringify({ host: url.host, status: "ok", release: data.release }),
    );
  } catch {
    failed = true;
    console.error(JSON.stringify({ host: url.host, status: "unavailable" }));
  }
}
process.exitCode = failed ? 1 : 0;
