-- Versioned SQL migrations own the new training tables. Do not drizzle push the legacy scaffold over these tables.
begin;
create table public.training_catalog (
 module_id text primary key, module_name text not null, questions jsonb not null check(jsonb_typeof(questions)='array'),
 exam_ready boolean not null default false
);
alter table public.training_catalog enable row level security;
revoke all on public.training_catalog from anon, authenticated;
create table public.training_attempts (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 module_id text not null, module_name text not null, mode text not null check(mode in ('exploration','practice','exam')),
 questions jsonb not null, answers jsonb not null default '{}',
 started_at timestamptz not null default now(), completed_at timestamptz,
 duration_seconds integer not null default 0 check(duration_seconds>=0),
 question_count integer not null check(question_count>0), correct_count integer not null default 0,
 check(correct_count between 0 and question_count)
);
create index training_attempts_owner_date on public.training_attempts(user_id,started_at desc,id);
alter table public.training_attempts enable row level security;
revoke all on public.training_attempts from anon, authenticated;
grant select on public.training_attempts to authenticated;
create policy training_attempts_read_own on public.training_attempts for select to authenticated using(user_id=(select auth.uid()));

create function public.start_training_attempt(p_id uuid,p_module text,p_mode text,p_count integer)
returns public.training_attempts language plpgsql security definer set search_path='' as $$
declare c public.training_catalog; a public.training_attempts; qs jsonb;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_mode is null or p_count is null or p_mode not in ('exploration','practice','exam') or p_count<1 or p_count>100 then raise exception 'Invalid quiz settings'; end if;
 select * into a from public.training_attempts where id=p_id;
 if found then
  if a.user_id<>auth.uid() then raise exception 'Attempt unavailable'; end if;
  return a;
 end if;
 select * into c from public.training_catalog where module_id=p_module;
 if not found or jsonb_array_length(c.questions)=0 then raise exception 'Module in preparation'; end if;
 if p_mode='exam' and not c.exam_ready then raise exception 'Exam in preparation'; end if;
 select jsonb_agg(q) into qs from (select value q from jsonb_array_elements(c.questions) order by random() limit p_count) selected;
 insert into public.training_attempts(id,user_id,module_id,module_name,mode,questions,question_count)
 values(p_id,auth.uid(),c.module_id,c.module_name,p_mode,qs,jsonb_array_length(qs)) returning * into a;
 return a;
end; $$;

create function public.finish_training_attempt(p_id uuid,p_answers jsonb)
returns public.training_attempts language plpgsql security definer set search_path='' as $$
declare a public.training_attempts; q jsonb; chosen jsonb; expected jsonb; valid_answers jsonb:='{}'; correct integer:=0;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select * into a from public.training_attempts where id=p_id and user_id=auth.uid() for update;
 if not found then raise exception 'Attempt unavailable'; end if;
 if a.completed_at is not null then return a; end if;
 if jsonb_typeof(p_answers)<>'object' or octet_length(p_answers::text)>100000 then raise exception 'Invalid answers'; end if;
 for q in select value from jsonb_array_elements(a.questions) loop
  chosen:=coalesce(p_answers->(q->>'id'),'[]'::jsonb);
  if jsonb_typeof(chosen)<>'array' then raise exception 'Invalid selection'; end if;
  if exists(select 1 from jsonb_array_elements(chosen) v where jsonb_typeof(v)<>'string' or not exists(select 1 from jsonb_array_elements(q->'options') o where o->'id'=v)) then raise exception 'Invalid option'; end if;
  if jsonb_array_length(chosen)<>(select count(distinct value) from jsonb_array_elements(chosen)) then raise exception 'Duplicate selection'; end if;
  select coalesce(jsonb_agg(v order by v),'[]') into chosen from (select distinct value v from jsonb_array_elements(chosen)) x;
  select coalesce(jsonb_agg(o->'id' order by o->'id'),'[]') into expected from jsonb_array_elements(q->'options') o where (o->>'isCorrect')::boolean;
  if chosen=expected and jsonb_array_length(expected)>0 then correct:=correct+1; end if;
  valid_answers:=valid_answers||jsonb_build_object(q->>'id',chosen);
 end loop;
 update public.training_attempts set answers=valid_answers,correct_count=correct,completed_at=now(),
 duration_seconds=greatest(0,least(86400,extract(epoch from now()-started_at)::integer))
 where id=p_id returning * into a;
 return a;
end; $$;
revoke all on function public.start_training_attempt(uuid,text,text,integer) from public,anon;
revoke all on function public.finish_training_attempt(uuid,jsonb) from public,anon;
grant execute on function public.start_training_attempt(uuid,text,text,integer) to authenticated;
grant execute on function public.finish_training_attempt(uuid,jsonb) to authenticated;
create function public.training_summary() returns jsonb language sql stable security invoker set search_path='' as $$
 select jsonb_build_object(
  'sessions',count(*),'questions',coalesce(sum(question_count),0),
  'correct',coalesce(sum(correct_count),0),'seconds',coalesce(sum(duration_seconds),0)
 ) from public.training_attempts where user_id=auth.uid() and completed_at is not null;
$$;
revoke all on function public.training_summary() from public,anon;
grant execute on function public.training_summary() to authenticated;
commit;
