// Public-route smoke comparison. No credentials or user data are transmitted.
const hosts = process.argv.slice(2);
if (hosts.length !== 2) throw new Error('Usage: node scripts/compare-hosts.mjs VERCEL_ORIGIN CLOUDFLARE_ORIGIN');
for (const host of hosts) {
  const origin = new URL(host).origin;
  for (const path of ['/fr', '/en', '/fr/login', '/fr/exams', '/api/subscriptions']) {
    const times = [];
    let status;
    for (let i = 0; i < 3; i++) {
      const start = performance.now();
      const response = await fetch(origin + path, {redirect:'manual', signal:AbortSignal.timeout(30000)});
      times.push(Math.round(performance.now() - start));
      status = response.status;
      await response.arrayBuffer();
    }
    const sorted = [...times].sort((a,b)=>a-b);
    console.log(JSON.stringify({origin,path,status,headerLatencyMs:times,medianMs:sorted[1]}));
  }
}
