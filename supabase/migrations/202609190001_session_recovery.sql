begin;
alter table public.training_attempts add column deadline_at timestamptz, add column draft_answers jsonb not null default '{}', add column draft_index integer not null default 0, add column draft_revision integer not null default 0, add column abandoned_at timestamptz, add column sample_exam boolean not null default false;
-- Answer snapshots for running exams are never exposed through the data API.
create schema if not exists medqcm_private;
revoke all on schema medqcm_private from public,anon,authenticated;
create table medqcm_private.exam_keys(attempt_id uuid primary key references public.training_attempts(id) on delete cascade,questions jsonb not null);

alter function public.start_training_attempt(uuid,text,text,integer) rename to start_training_attempt_core;
alter function public.finish_training_attempt(uuid,jsonb) rename to finish_training_attempt_core;
revoke all on function public.start_training_attempt_core(uuid,text,text,integer) from public,anon,authenticated;
revoke all on function public.finish_training_attempt_core(uuid,jsonb) from public,anon,authenticated;

create function medqcm_private.validate_answers(qs jsonb,answers jsonb) returns void language plpgsql set search_path='' as $$
declare q jsonb; chosen jsonb;
begin
 if answers is null or jsonb_typeof(answers)<>'object' or octet_length(answers::text)>100000 then raise exception 'Invalid answers'; end if;
 if exists(select 1 from jsonb_object_keys(answers) k where not exists(select 1 from jsonb_array_elements(qs) item where item->>'id'=k)) then raise exception 'Unknown question'; end if;
 for q in select value from jsonb_array_elements(qs) loop
  chosen:=coalesce(answers->(q->>'id'),'[]');
  if jsonb_typeof(chosen)<>'array' or jsonb_array_length(chosen)>20 then raise exception 'Invalid selection'; end if;
  if jsonb_array_length(chosen)<>(select count(distinct value) from jsonb_array_elements(chosen)) then raise exception 'Duplicate selection'; end if;
  if exists(select 1 from jsonb_array_elements(chosen) v where jsonb_typeof(v)<>'string' or not exists(select 1 from jsonb_array_elements(q->'options') o where o->'id'=v)) then raise exception 'Invalid option'; end if;
 end loop;
end; $$;

create function public.start_training_attempt(p_id uuid,p_module text,p_mode text,p_count integer,p_sample boolean default false)
returns public.training_attempts language plpgsql security definer set search_path='' as $$
declare a public.training_attempts; qs jsonb;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select * into a from public.training_attempts where id=p_id;
 if found then
  if a.user_id<>auth.uid() or a.module_id<>p_module or a.mode<>p_mode then raise exception 'Attempt unavailable'; end if;
  return a;
 end if;
 if p_mode='exam' and p_sample then
  if p_module not in ('mod-y1-anat-general','mod-y2-cardio','mod-y3-semio-cardio','mod-y4-cardio-sca') then raise exception 'No sample exam'; end if;
  a:=public.start_training_attempt_core(p_id,p_module,'practice',p_count);
  update public.training_attempts set mode='exam',sample_exam=true where id=p_id;
 else a:=public.start_training_attempt_core(p_id,p_module,p_mode,p_count);
 end if;
 if p_mode='exam' then
  insert into medqcm_private.exam_keys values(p_id,a.questions);
  select jsonb_agg((q-'explanation')||jsonb_build_object('options',(select jsonb_agg(o-'isCorrect') from jsonb_array_elements(q->'options') o))) into qs from jsonb_array_elements(a.questions) q;
  update public.training_attempts set questions=qs,deadline_at=started_at+question_count*interval '90 seconds' where id=p_id;
 end if;
 select * into a from public.training_attempts where id=p_id; return a;
end; $$;

create function public.finish_training_attempt(p_id uuid,p_answers jsonb)
returns public.training_attempts language plpgsql security definer set search_path='' as $$
declare a public.training_attempts; qs jsonb; selections jsonb;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select * into a from public.training_attempts where id=p_id and user_id=auth.uid() for update;
 if not found or a.abandoned_at is not null then raise exception 'Attempt unavailable'; end if;
 if a.completed_at is not null then return a; end if;
 selections:=case when a.deadline_at is not null and clock_timestamp()>=a.deadline_at then a.draft_answers else p_answers end;
 perform medqcm_private.validate_answers(a.questions,selections);
 if a.mode='exam' then
  select questions into qs from medqcm_private.exam_keys where attempt_id=p_id;
  update public.training_attempts set questions=qs where id=p_id;
 end if;
 a:=public.finish_training_attempt_core(p_id,selections);
 if a.deadline_at is not null then
  update public.training_attempts set completed_at=least(completed_at,deadline_at),duration_seconds=least(duration_seconds,question_count*90) where id=p_id returning * into a;
 end if;
 return a;
end; $$;

create function public.save_training_draft(p_id uuid,p_answers jsonb,p_index integer,p_revision integer)
returns public.training_attempts language plpgsql security definer set search_path='' as $$
declare a public.training_attempts;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select * into a from public.training_attempts where id=p_id and user_id=auth.uid() for update;
 if not found or a.abandoned_at is not null then raise exception 'Attempt unavailable'; end if;
 if a.completed_at is not null then return a; end if;
 if a.deadline_at is not null and clock_timestamp()>=a.deadline_at then return public.finish_training_attempt(p_id,a.draft_answers); end if;
 if p_index is null or p_index<0 or p_index>=a.question_count or p_revision is null then raise exception 'Invalid draft'; end if;
 if p_revision<>a.draft_revision then raise exception 'Draft changed on another tab. Reload before editing.'; end if;
 perform medqcm_private.validate_answers(a.questions,p_answers);
 update public.training_attempts set draft_answers=p_answers,draft_index=p_index,draft_revision=draft_revision+1 where id=p_id returning * into a;
 return a;
end; $$;

create function public.get_training_attempt(p_id uuid) returns public.training_attempts language plpgsql security definer set search_path='' as $$
declare a public.training_attempts;
begin
 select * into a from public.training_attempts where id=p_id and user_id=auth.uid();
 if not found then raise exception 'Attempt unavailable'; end if;
 if a.deadline_at is not null and clock_timestamp()>=a.deadline_at and a.completed_at is null and a.abandoned_at is null then return public.finish_training_attempt(p_id,a.draft_answers); end if;
 return a;
end; $$;

create function public.abandon_training_attempt(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.training_attempts where id=p_id and user_id=auth.uid() for update;
 if not found then raise exception 'Attempt unavailable'; end if;
 update public.training_attempts set abandoned_at=now() where id=p_id and completed_at is null;
end; $$;

revoke all on function public.start_training_attempt(uuid,text,text,integer,boolean),public.finish_training_attempt(uuid,jsonb),public.save_training_draft(uuid,jsonb,integer,integer),public.get_training_attempt(uuid),public.abandon_training_attempt(uuid) from public,anon;
grant execute on function public.start_training_attempt(uuid,text,text,integer,boolean),public.finish_training_attempt(uuid,jsonb),public.save_training_draft(uuid,jsonb,integer,integer),public.get_training_attempt(uuid),public.abandon_training_attempt(uuid) to authenticated;
commit;
