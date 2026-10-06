-- Admin-only drafts. Saving a question never publishes it to students.
begin;

create table public.question_drafts (
  id text primary key,
  module_id text not null,
  module_name text not null,
  question jsonb not null check(jsonb_typeof(question)='object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index question_drafts_by_module on public.question_drafts(module_id,updated_at desc);
alter table public.question_drafts enable row level security;
revoke all on public.question_drafts from public,anon,authenticated;

create function public.admin_question_drafts()
returns table(id text,module_id text,module_name text,question jsonb,updated_at timestamptz)
language plpgsql stable security definer set search_path='' as $$
begin
  if not public.is_medqcm_admin() then raise exception 'Admin required'; end if;
  return query select d.id,d.module_id,d.module_name,d.question,d.updated_at
    from public.question_drafts d order by d.updated_at desc,d.id;
end; $$;
revoke all on function public.admin_question_drafts() from public,anon;
grant execute on function public.admin_question_drafts() to authenticated;

create function public.admin_upsert_question_draft(p_module text,p_module_name text,p_question jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare qid text;
begin
  if not public.is_medqcm_admin() then raise exception 'Admin required'; end if;
  qid:=p_question->>'id';
  if p_module is null or p_module !~ '^[a-zA-Z0-9-]{3,100}$'
    or length(trim(coalesce(p_module_name,''))) not between 3 and 200
    or jsonb_typeof(p_question) is distinct from 'object'
    or length(trim(coalesce(qid,''))) not between 2 and 100
    or length(trim(coalesce(p_question->>'questionText',''))) not between 10 and 2000
    or length(coalesce(p_question->>'explanation',''))>5000
    or length(trim(coalesce(p_question->>'source',''))) not between 3 and 500
    or coalesce(p_question->>'difficulty','') not in ('easy','medium','hard')
    or jsonb_typeof(p_question->'options') is distinct from 'array'
    or jsonb_array_length(p_question->'options') not between 2 and 8
    or exists(select 1 from jsonb_array_elements(p_question->'options') o
      where length(trim(coalesce(o->>'id',''))) not between 2 and 100
        or length(trim(coalesce(o->>'text',''))) not between 1 and 1000
        or jsonb_typeof(o->'isCorrect') is distinct from 'boolean')
    or (select count(distinct o->>'id') from jsonb_array_elements(p_question->'options') o)
        <> jsonb_array_length(p_question->'options')
    or not exists(select 1 from jsonb_array_elements(p_question->'options') o where o->>'isCorrect'='true')
  then raise exception 'Invalid question draft'; end if;

  insert into public.question_drafts(id,module_id,module_name,question)
    values(qid,trim(p_module),trim(p_module_name),p_question)
    on conflict(id) do update set module_id=excluded.module_id,module_name=excluded.module_name,
      question=excluded.question,updated_at=now();
  return p_question;
end; $$;
revoke all on function public.admin_upsert_question_draft(text,text,jsonb) from public,anon;
grant execute on function public.admin_upsert_question_draft(text,text,jsonb) to authenticated;

create function public.admin_remove_question_draft(p_id text)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  if not public.is_medqcm_admin() then raise exception 'Admin required'; end if;
  delete from public.question_drafts where id=p_id;
  return found;
end; $$;
revoke all on function public.admin_remove_question_draft(text) from public,anon;
grant execute on function public.admin_remove_question_draft(text) to authenticated;

create function public.admin_overview_metrics()
returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
  if not public.is_medqcm_admin() then raise exception 'Admin required'; end if;
  return jsonb_build_object(
    'registered_accounts',(select count(*) from auth.users),
    'sample_questions',(select coalesce(sum(jsonb_array_length(questions)),0) from public.training_catalog where reviewed_at is null),
    'reviewed_questions',(select coalesce(sum(jsonb_array_length(questions)),0) from public.training_catalog where reviewed_at is not null),
    'private_drafts',(select count(*) from public.question_drafts),
    'pending_receipts',(select count(*) from public.receipt_requests where status='pending'),
    'active_subscriptions',(select count(*) from public.subscription_entitlements where expires_at>now())
  );
end; $$;
revoke all on function public.admin_overview_metrics() from public,anon;
grant execute on function public.admin_overview_metrics() to authenticated;

commit;
