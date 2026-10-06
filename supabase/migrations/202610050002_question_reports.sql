-- Durable owner-scoped reports from completed attempts; admin review is audited.
begin;
create table public.question_reports (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_id uuid not null references public.training_attempts(id),
  module_id text not null,
  question_id text not null,
  question_text text not null,
  reason text not null check(reason in ('correction_error','unclear','typo','other')),
  comment text not null check(length(comment) between 10 and 2000),
  status text not null default 'pending' check(status in ('pending','resolved')),
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  unique(user_id,attempt_id,question_id)
);
create index question_reports_queue on public.question_reports(status,created_at,id);
alter table public.question_reports enable row level security;
revoke all on public.question_reports from public,anon,authenticated;
grant select on public.question_reports to authenticated;
create policy question_reports_owner_or_admin on public.question_reports for select to authenticated
  using(user_id=(select auth.uid()) or (select public.is_medqcm_admin()));

create function public.submit_question_report(p_id uuid,p_attempt uuid,p_question text,p_reason text,p_comment text)
returns public.question_reports language plpgsql security definer set search_path='' as $$
declare a public.training_attempts; q jsonb; r public.question_reports;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_reason is null or p_reason not in ('correction_error','unclear','typo','other')
    or length(trim(coalesce(p_comment,''))) not between 10 and 2000 then raise exception 'Invalid report'; end if;
  select * into a from public.training_attempts
    where id=p_attempt and user_id=auth.uid() and completed_at is not null;
  if not found then raise exception 'Attempt unavailable'; end if;
  select item into q from jsonb_array_elements(a.questions) item where item->>'id'=p_question limit 1;
  if q is null then raise exception 'Question unavailable'; end if;
  insert into public.question_reports(id,user_id,attempt_id,module_id,question_id,question_text,reason,comment)
    values(p_id,auth.uid(),p_attempt,a.module_id,p_question,q->>'questionText',p_reason,trim(p_comment))
    on conflict(user_id,attempt_id,question_id) do nothing
    returning * into r;
  if r.id is null then
    select * into r from public.question_reports
      where user_id=auth.uid() and attempt_id=p_attempt and question_id=p_question;
  end if;
  return r;
end; $$;
revoke all on function public.submit_question_report(uuid,uuid,text,text,text) from public,anon;
grant execute on function public.submit_question_report(uuid,uuid,text,text,text) to authenticated;

create function public.resolve_question_report(p_id uuid,p_note text)
returns public.question_reports language plpgsql security definer set search_path='' as $$
declare r public.question_reports;
begin
  if not public.is_medqcm_admin() then raise exception 'Admin required'; end if;
  if length(coalesce(p_note,''))>2000 then raise exception 'Invalid note'; end if;
  select * into r from public.question_reports where id=p_id for update;
  if not found then raise exception 'Report unavailable'; end if;
  if r.status='resolved' then return r; end if;
  update public.question_reports set status='resolved',admin_note=coalesce(p_note,''),
    reviewed_at=now(),reviewed_by=auth.uid() where id=p_id returning * into r;
  return r;
end; $$;
revoke all on function public.resolve_question_report(uuid,text) from public,anon;
grant execute on function public.resolve_question_report(uuid,text) to authenticated;
commit;
