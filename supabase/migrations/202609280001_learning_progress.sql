-- Read-only progress and a repeatable mistakes queue. No sample is promoted to a reviewed exam.
begin;

alter table public.training_catalog
  add column reviewed_at timestamptz,
  add column reviewed_by uuid references auth.users(id),
  add column source_reference text;
alter table public.training_catalog
  add constraint training_catalog_exam_review_required check (
    not exam_ready or (
      reviewed_at is not null and reviewed_by is not null
      and nullif(trim(source_reference),'') is not null
    )
  );

create function medqcm_private.invalidate_catalog_review()
returns trigger language plpgsql set search_path='' as $$
begin
  if old.questions is distinct from new.questions then
    new.reviewed_at:=null;
    new.reviewed_by:=null;
    new.source_reference:=null;
    new.exam_ready:=false;
  end if;
  return new;
end; $$;
create trigger training_catalog_questions_changed
  before update of questions on public.training_catalog
  for each row execute function medqcm_private.invalidate_catalog_review();

-- Legacy demo labels claimed exam/faculty provenance that was never verified.
update public.training_catalog c
set questions=(
  select jsonb_agg(q.item||jsonb_build_object('source','Exemple non validé') order by q.position)
  from jsonb_array_elements(c.questions) with ordinality q(item,position)
)
where c.module_id in (
  'mod-y1-anat-general','mod-y2-cardio','mod-y3-semio-cardio','mod-y4-cardio-sca'
) and c.reviewed_at is null;

alter table public.training_attempts
  add column review_attempt boolean not null default false;

create index training_attempts_completed_owner_module
  on public.training_attempts(user_id,module_id,completed_at desc,id)
  where completed_at is not null;

create function public.training_module_progress()
returns table(
  module_id text, module_name text, sessions bigint, questions_presented bigint,
  correct_answers bigint, unique_questions_seen bigint, catalog_questions integer,
  last_completed_at timestamptz
)
language sql stable security definer set search_path='' as $$
  with completed as (
    select a.module_id,
      (array_agg(a.module_name order by a.completed_at desc,a.id desc))[1] as module_name,
      count(*) as sessions,
      coalesce(sum(a.question_count),0) as questions_presented,
      coalesce(sum(a.correct_count),0) as correct_answers,
      max(a.completed_at) as last_completed_at
    from public.training_attempts a
    where a.user_id=(select auth.uid()) and a.completed_at is not null
    group by a.module_id
  ), seen as (
    select a.module_id,count(distinct q.item->>'id') as unique_questions_seen
    from public.training_attempts a
    cross join lateral jsonb_array_elements(a.questions) q(item)
    where a.user_id=(select auth.uid()) and a.completed_at is not null
    group by a.module_id
  )
  select c.module_id,c.module_name,c.sessions,c.questions_presented,c.correct_answers,
    coalesce(s.unique_questions_seen,0),
    case when t.module_id is null then null else jsonb_array_length(t.questions) end,
    c.last_completed_at
  from completed c
  left join seen s on s.module_id=c.module_id
  left join public.training_catalog t on t.module_id=c.module_id
  order by c.last_completed_at desc,c.module_id;
$$;
revoke all on function public.training_module_progress() from public,anon;
grant execute on function public.training_module_progress() to authenticated;

create function public.training_review_queue(p_module text default null)
returns table(
  module_id text, module_name text, question_id text, question jsonb,
  selected jsonb, last_completed_at timestamptz, status text
)
language sql stable security definer set search_path='' as $$
  with snapshots as (
    select a.module_id,a.module_name,q.item->>'id' as question_id,q.item as question,
      coalesce(a.answers->(q.item->>'id'),'[]'::jsonb) as selected,
      a.completed_at,a.id,
      row_number() over (
        partition by a.module_id,q.item->>'id'
        order by a.completed_at desc,a.id desc
      ) as rn
    from public.training_attempts a
    cross join lateral jsonb_array_elements(a.questions) q(item)
    where a.user_id=(select auth.uid()) and a.completed_at is not null
      and (p_module is null or a.module_id=p_module)
  ), latest as (
    select s.*,
      array(select distinct v.value from jsonb_array_elements_text(s.selected) v(value) order by v.value) as chosen,
      array(select o.item->>'id' from jsonb_array_elements(s.question->'options') o(item)
        where o.item->>'isCorrect'='true' order by o.item->>'id') as expected
    from snapshots s where s.rn=1
  )
  select l.module_id,l.module_name,l.question_id,l.question,l.selected,l.completed_at,
    case when jsonb_array_length(l.selected)=0 then 'unanswered' else 'wrong' end
  from latest l
  where l.chosen is distinct from l.expected
  order by l.completed_at desc,l.module_id,l.question_id;
$$;
revoke all on function public.training_review_queue(text) from public,anon;
grant execute on function public.training_review_queue(text) to authenticated;

create function public.start_review_attempt(p_id uuid,p_module text,p_count integer)
returns public.training_attempts
language plpgsql security definer set search_path='' as $$
declare a public.training_attempts; qs jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_count is null or p_count<1 or p_count>100 then raise exception 'Invalid question count'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
  select * into a from public.training_attempts where id=p_id;
  if found then
    if a.user_id<>auth.uid() or a.module_id<>p_module or not a.review_attempt then
      raise exception 'Attempt unavailable';
    end if;
    return a;
  end if;

  select jsonb_agg(p.question) into qs from (
    select q.item as question
    from public.training_review_queue(p_module) r
    join public.training_catalog c on c.module_id=r.module_id
    cross join lateral jsonb_array_elements(c.questions) q(item)
    where r.question_id=q.item->>'id' and r.module_id=p_module
    order by random() limit p_count
  ) p;
  if qs is null or jsonb_array_length(qs)=0 then raise exception 'No questions to review'; end if;

  -- The existing start function enforces subscription and module access.
  a:=public.start_training_attempt(p_id,p_module,'practice',p_count,false);
  update public.training_attempts
    set questions=qs,question_count=jsonb_array_length(qs),review_attempt=true
    where id=p_id returning * into a;
  return a;
end; $$;
revoke all on function public.start_review_attempt(uuid,text,integer) from public,anon;
grant execute on function public.start_review_attempt(uuid,text,integer) to authenticated;

create function public.available_training_exams()
returns table(module_id text,module_name text,question_count integer,requires_subscription boolean)
language sql stable security definer set search_path='' as $$
  select c.module_id,c.module_name,jsonb_array_length(c.questions),c.requires_subscription
  from public.training_catalog c
  where auth.uid() is not null and c.exam_ready and c.reviewed_at is not null
    and c.reviewed_by is not null and nullif(trim(c.source_reference),'') is not null
    and jsonb_array_length(c.questions)>0
  order by c.module_name,c.module_id;
$$;
revoke all on function public.available_training_exams() from public,anon;
grant execute on function public.available_training_exams() to authenticated;

create function public.training_catalog_overview()
returns table(module_id text,module_name text,question_count integer,reviewed boolean)
language sql stable security definer set search_path='' as $$
  select c.module_id,c.module_name,jsonb_array_length(c.questions),
    c.reviewed_at is not null and c.reviewed_by is not null
      and nullif(trim(c.source_reference),'') is not null
  from public.training_catalog c
  where auth.uid() is not null and jsonb_array_length(c.questions)>0
  order by c.module_name,c.module_id;
$$;
revoke all on function public.training_catalog_overview() from public,anon;
grant execute on function public.training_catalog_overview() to authenticated;

commit;
