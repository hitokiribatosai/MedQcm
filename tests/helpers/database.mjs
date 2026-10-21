import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
export const identities = {
  student: "11111111-1111-4111-8111-111111111111",
  other: "22222222-2222-4222-8222-222222222222",
  admin: "77777777-7777-4777-8777-777777777777",
  reviewer: "88888888-8888-4888-8888-888888888888",
  editor: "99999999-9999-4999-8999-999999999999",
  payments: "66666666-6666-4666-8666-666666666666",
};
export async function database() {
  const db = new PGlite();
  await db.exec(`create role anon;create role authenticated;create role service_role;
 create schema auth;create table auth.users(id uuid primary key,raw_app_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth to anon,authenticated,service_role;grant execute on function auth.uid() to anon,authenticated,service_role;
 create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;
 grant usage on schema storage to authenticated;grant select,insert on storage.objects to authenticated;
 create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;`);
  for (const [name, id] of Object.entries(identities))
    await db.query("insert into auth.users values($1,$2)", [
      id,
      JSON.stringify({
        role:
          {
            admin: "admin",
            reviewer: "medical_reviewer",
            editor: "content_editor",
            payments: "payment_manager",
          }[name] || "student",
      }),
    ]);
  for (const file of readdirSync("supabase/migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    try {
      await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8"));
    } catch (e) {
      console.error("Migration failed:", file);
      throw e;
    }
  }
  const as = async (name) =>
    db.exec(
      `reset role;set role authenticated;set request.jwt.claim.sub='${identities[name]}';`,
    );
  const rpc = async (name, args = []) =>
    (
      await db.query(
        `select to_jsonb(public.${name}(${args.map((_, i) => "$" + (i + 1)).join(",")})) as result`,
        args,
      )
    ).rows[0].result;
  return { db, as, rpc };
}
