// Uses only the disposable local Supabase stack; never consumes the production .env.local.
import { execFileSync, spawnSync } from "node:child_process";
const env = { ...process.env };
const output = execFileSync("supabase", ["status", "-o", "env"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
});
const values = Object.fromEntries(
  output
    .split("\n")
    .map((line) => line.match(/^([A-Z_]+)="?(.*?)"?$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
const url = values.API_URL;
if (
  !url ||
  !["127.0.0.1", "localhost"].includes(new URL(url).hostname) ||
  !values.ANON_KEY ||
  !values.SERVICE_ROLE_KEY
)
  throw Error("Local Supabase configuration unavailable");
env.NEXT_PUBLIC_SUPABASE_URL = url;
env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = values.ANON_KEY;
env.TEST_SUPABASE_SERVICE_ROLE_KEY = values.SERVICE_ROLE_KEY;
env.TEST_APP_URL = "http://127.0.0.1:3100";
for (const args of [
  ["run", "build"],
  ["exec", "--", "playwright", "test"],
]) {
  const result = spawnSync("npm", args, { env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
