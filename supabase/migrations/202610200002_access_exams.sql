begin;
create table public.academic_periods (
 id uuid primary key default gen_random_uuid(), title text not null check(length(trim(title)) between 3 and 120),
 starts_at timestamptz not null, ends_at timestamptz not null, check(ends_at>starts_at)
);
create table public.subscription_offers (
 id uuid primary key default gen_random_uuid(), title text not null check(length(trim(title)) between 3 and 150),
 release_id uuid not null references public.curriculum_releases, period_id uuid not null references public.academic_periods,
 scope text not null check(scope in ('year','all_years','module','residency')), amount integer not null check(amount>0),
 active boolean not null default false, terms text not null check(length(trim(terms))>=10), created_at timestamptz not null default now()
);
-- Offers are immutable once created; retire an offer and create a replacement to change terms.
create table public.access_grants (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users,
 receipt_id uuid unique references public.receipt_requests, release_id uuid references public.curriculum_releases,
 scope text not null check(scope in ('year','all_years','module','residency','legacy')),
 study_year integer, module_id text references public.curriculum_modules,
 starts_at timestamptz not null, ends_at timestamptz not null, revoked_at timestamptz, revoked_by uuid references auth.users,
 revocation_reason text, created_at timestamptz not null default now(), check(ends_at>starts_at),
 check((scope='year' and study_year is not null and study_year between 1 and 7 and module_id is null) or (scope='module' and module_id is not null and study_year is null) or (scope in ('all_years','residency','legacy') and study_year is null and module_id is null)),
 check(scope='legacy' or release_id is not null)
);
create index active_access_grants on public.access_grants(user_id,ends_at) where revoked_at is null;
insert into public.access_grants(user_id,scope,starts_at,ends_at)
 select user_id,'legacy',least(updated_at,expires_at-interval '1 second'),expires_at from public.subscription_entitlements;
alter table public.receipt_requests add column offer_id uuid references public.subscription_offers, add column coverage jsonb;
-- Preserve old receipts and prevent new submissions using the old broad-access API.
revoke execute on function public.submit_receipt(uuid,text,text,text,text) from authenticated;

do $$declare t text;begin
 foreach t in array array['academic_periods','subscription_offers','access_grants'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 end loop;
end$$;
grant select on public.access_grants to authenticated;
create policy own_access_grants on public.access_grants for select to authenticated using(user_id=auth.uid() or public.has_staff_capability('payments'));

create function public.can_access_module(p_module text) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(
 select 1 from public.curriculum_modules m join public.curriculum_releases r on r.id=m.release_id
 where m.id=p_module and m.active and r.status<>'archived' and (
 not m.requires_subscription or public.has_staff_capability('edit') or public.has_staff_capability('review') or exists(
 select 1 from public.access_grants g where g.user_id=auth.uid() and g.revoked_at is null and g.starts_at<=now() and g.ends_at>now()
 and (g.scope='legacy' or (g.release_id=m.release_id and (
 (g.scope='all_years' and m.study_year<=7) or (g.scope='year' and g.study_year=m.study_year) or
 (g.scope='module' and g.module_id=m.id) or (g.scope='residency' and m.study_year=8)))))));
$$;

create function public.subscription_options() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('offers',coalesce((select jsonb_agg(to_jsonb(o)||jsonb_build_object('starts_at',p.starts_at,'ends_at',p.ends_at,'period_title',p.title) order by o.amount)
 from public.subscription_offers o join public.academic_periods p on p.id=o.period_id where (o.active and p.ends_at>now()) or public.has_staff_capability('payments')),'[]'),
 'grants',coalesce((select jsonb_agg(to_jsonb(g) order by g.ends_at desc) from public.access_grants g where g.user_id=auth.uid()),'[]')) where auth.uid() is not null;
$$;

create function public.manage_offer(p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not public.has_staff_capability('payments') then raise exception 'Payment manager required'; end if;
 if p_action='period' then
 insert into public.academic_periods(title,starts_at,ends_at) values(p_data->>'title',(p_data->>'starts_at')::timestamptz,(p_data->>'ends_at')::timestamptz) returning to_jsonb(academic_periods) into result;
 elsif p_action='offer' then
 insert into public.subscription_offers(title,release_id,period_id,scope,amount,terms)
 values(p_data->>'title',(p_data->>'release_id')::uuid,(p_data->>'period_id')::uuid,p_data->>'scope',(p_data->>'amount')::integer,p_data->>'terms') returning to_jsonb(subscription_offers) into result;
 elsif p_action='activate' then
 update public.subscription_offers set active=(p_data->>'active')::boolean where id=(p_data->>'id')::uuid returning to_jsonb(subscription_offers) into result;
 elsif p_action='revoke' then
 if length(trim(coalesce(p_data->>'reason','')))<10 then raise exception 'Revocation reason required'; end if;
 update public.access_grants set revoked_at=coalesce(revoked_at,now()),revoked_by=coalesce(revoked_by,auth.uid()),revocation_reason=coalesce(revocation_reason,p_data->>'reason')
 where id=(p_data->>'id')::uuid returning jsonb_build_object('id',id) into result;
 else raise exception 'Unknown offer action'; end if;
 if result is null then raise exception 'Record unavailable'; end if;
 perform medqcm_private.audit('offer.'||p_action,result->>'id',p_data); return result;
end; $$;

create function public.submit_scoped_receipt(p_id uuid,p_offer uuid,p_year integer,p_module text,p_path text,p_reference text,p_note text)
returns public.receipt_requests language plpgsql security definer set search_path='' as $$
declare o public.subscription_offers; p public.academic_periods; r public.receipt_requests; coverage jsonb; ref text;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,1));
 select * into r from public.receipt_requests where id=p_id;
 if found then if r.user_id<>auth.uid() then raise exception 'Unavailable'; end if; return r; end if;
 if not exists(select 1 from public.payment_configuration where id and accepting_payments and length(trim(instructions))>0) then raise exception 'Payments closed'; end if;
 select * into o from public.subscription_offers where id=p_offer and active for share;
 if not found then raise exception 'Offer unavailable'; end if;
 select * into p from public.academic_periods where id=o.period_id;
 if p.ends_at<=now() then raise exception 'Offer expired'; end if;
 if (o.scope='year' and (p_year is null or p_year not between 1 and 7)) or (o.scope<>'year' and p_year is not null)
 or (o.scope='module' and not exists(select 1 from public.curriculum_modules where id=p_module and release_id=o.release_id and active))
 or (o.scope<>'module' and p_module is not null) then raise exception 'Invalid access selection'; end if;
 if o.scope='year' and not exists(select 1 from public.curriculum_modules where release_id=o.release_id and study_year=p_year and active) then raise exception 'Year unavailable'; end if;
 ref:=regexp_replace(lower(trim(coalesce(p_reference,''))),'\s+','','g');
 if length(ref) not between 3 and 200 or length(coalesce(p_note,''))>2000 then raise exception 'Invalid payment reference'; end if;
 perform pg_advisory_xact_lock(hashtextextended(ref,3));
 if exists(select 1 from public.receipt_requests where regexp_replace(lower(trim(transaction_reference)),'\s+','','g')=ref and status<>'rejected') then raise exception 'Reference already submitted; contact support'; end if;
 if split_part(p_path,'/',1)<>auth.uid()::text or split_part(p_path,'/',2)<>p_id::text or not exists(select 1 from storage.objects where bucket_id='payment-receipts' and name=p_path) then raise exception 'Receipt unavailable'; end if;
 coverage:=jsonb_build_object('scope',o.scope,'release_id',o.release_id,'study_year',p_year,'module_id',p_module,'starts_at',p.starts_at,'ends_at',p.ends_at,'offer_title',o.title,'terms',o.terms);
 insert into public.receipt_requests(id,user_id,plan,amount,duration_days,proof_path,transaction_reference,note,offer_id,coverage)
 values(p_id,auth.uid(),'annual',o.amount,greatest(1,ceil(extract(epoch from p.ends_at-p.starts_at)/86400)::integer),p_path,trim(p_reference),coalesce(p_note,''),o.id,coverage) returning * into r;
 return r;
end; $$;

create or replace function public.review_receipt(p_id uuid,p_decision text,p_note text)
returns public.receipt_requests language plpgsql security definer set search_path='' as $$
declare r public.receipt_requests;
begin
 if not public.has_staff_capability('payments') then raise exception 'Payment manager required'; end if;
 if p_decision is null or p_decision not in ('approved','rejected') or length(coalesce(p_note,''))>2000 then raise exception 'Invalid decision'; end if;
 select * into r from public.receipt_requests where id=p_id for update;
 if not found then raise exception 'Receipt unavailable'; end if;
 if r.status<>'pending' then if r.status<>p_decision then raise exception 'Already reviewed'; end if; return r; end if;
 if p_decision='approved' then
 if r.coverage is null or r.offer_id is null then raise exception 'Legacy request: reject and request a scoped purchase'; end if;
 if (r.coverage->>'ends_at')::timestamptz<=now() then raise exception 'Purchased period expired; arrange refund or new request'; end if;
 insert into public.access_grants(user_id,receipt_id,release_id,scope,study_year,module_id,starts_at,ends_at)
 values(r.user_id,r.id,(r.coverage->>'release_id')::uuid,r.coverage->>'scope',(r.coverage->>'study_year')::integer,r.coverage->>'module_id',greatest(now(),(r.coverage->>'starts_at')::timestamptz),(r.coverage->>'ends_at')::timestamptz);
 end if;
 update public.receipt_requests set status=p_decision,admin_note=coalesce(p_note,''),reviewed_at=now(),reviewed_by=auth.uid() where id=p_id returning * into r;
 perform medqcm_private.audit('receipt.'||p_decision,r.id::text,jsonb_build_object('coverage',r.coverage)); return r;
end; $$;
drop policy receipt_owner_or_admin on public.receipt_requests;
create policy receipt_owner_or_admin on public.receipt_requests for select to authenticated using(user_id=auth.uid() or public.has_staff_capability('payments'));
drop policy receipt_read on storage.objects;
create policy receipt_read on storage.objects for select to authenticated using(bucket_id='payment-receipts' and ((storage.foldername(name))[1]=auth.uid()::text or public.has_staff_capability('payments')));

create table public.exam_definitions (
 id uuid primary key default gen_random_uuid(), module_id text not null references public.curriculum_modules,
 title text not null check(length(trim(title)) between 3 and 200), question_count integer not null check(question_count between 1 and 100),
 duration_seconds integer not null check(duration_seconds between 30 and 14400), max_attempts integer not null default 0 check(max_attempts between 0 and 100),
 scoring text not null default 'exact_set_v1' check(scoring='exact_set_v1'),
 status text not null default 'draft' check(status in ('draft','published','retired')),
 author_id uuid not null references auth.users, reviewed_by uuid references auth.users, review_note text not null default '', reviewed_at timestamptz,
 check(status<>'published' or (reviewed_by is not null and reviewed_by<>author_id and reviewed_at is not null and length(trim(review_note))>=3))
);
alter table public.exam_definitions enable row level security;
revoke all on public.exam_definitions from public,anon,authenticated;
alter table public.training_attempts add column exam_definition_id uuid references public.exam_definitions,
 add column rule_snapshot jsonb not null default '{"scoring":"exact_set_v1","corrections":"after_submission"}';
create index attempts_exam_owner on public.training_attempts(user_id,exam_definition_id);

create function public.manage_exam(p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare e public.exam_definitions;
begin
 if p_action='create' then
 if not public.has_staff_capability('edit') then raise exception 'Editor required'; end if;
 insert into public.exam_definitions(module_id,title,question_count,duration_seconds,max_attempts,author_id)
 values(p_data->>'module_id',p_data->>'title',(p_data->>'question_count')::integer,(p_data->>'duration_seconds')::integer,coalesce((p_data->>'max_attempts')::integer,0),auth.uid()) returning * into e;
 elsif p_action in ('publish','retire') then
 if not public.has_staff_capability('review') then raise exception 'Reviewer required'; end if;
 select * into e from public.exam_definitions where id=(p_data->>'id')::uuid for update;
 if not found then raise exception 'Exam unavailable'; end if;
 if p_action='publish' then
 if e.status<>'draft' or e.author_id=auth.uid() then raise exception 'Independent review required'; end if;
 if not exists(select 1 from public.curriculum_modules m join public.curriculum_releases r on r.id=m.release_id join public.training_catalog c on c.module_id=m.id
 where m.id=e.module_id and m.active and r.status='verified' and m.catalog_mode='published' and jsonb_array_length(c.questions)>=e.question_count) then raise exception 'Insufficient published content or unverified curriculum'; end if;
 update public.exam_definitions set status='published',reviewed_by=auth.uid(),reviewed_at=now(),review_note=p_data->>'note' where id=e.id returning * into e;
 else update public.exam_definitions set status='retired' where id=e.id returning * into e; end if;
 else raise exception 'Unknown exam action'; end if;
 perform medqcm_private.audit('exam.'||p_action,e.id::text); return to_jsonb(e);
end; $$;

create or replace function public.start_training_attempt(p_id uuid,p_module text,p_mode text,p_count integer,p_sample boolean default false)
returns public.training_attempts language plpgsql security definer set search_path='' as $$
declare a public.training_attempts;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select * into a from public.training_attempts where id=p_id;
 if found then
 if a.user_id<>auth.uid() or a.module_id<>p_module or a.mode<>p_mode then raise exception 'Attempt unavailable'; end if;
 return a; -- Existing sessions remain accessible after subscription expiry.
 end if;
 if not public.can_access_module(p_module) then raise exception 'Module access required'; end if;
 if p_mode='exam' and not coalesce(p_sample,false) then raise exception 'Select a published exam definition'; end if;
 if p_sample and not exists(select 1 from public.curriculum_modules where id=p_module and catalog_mode='sample') then raise exception 'Not a sample module'; end if;
 return public.start_training_attempt_with_recovery(p_id,p_module,p_mode,p_count,p_sample);
end; $$;

create function public.start_configured_exam(p_id uuid,p_exam uuid) returns public.training_attempts language plpgsql security definer set search_path='' as $$
declare e public.exam_definitions; a public.training_attempts; qs jsonb; safe_qs jsonb;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select * into a from public.training_attempts where id=p_id;
 if found then if a.user_id<>auth.uid() or a.exam_definition_id is distinct from p_exam then raise exception 'Attempt unavailable'; end if;return a;end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_exam::text,4));
 select * into e from public.exam_definitions where id=p_exam and status='published';
 if not found or not public.can_access_module(e.module_id) then raise exception 'Exam unavailable'; end if;
 if not exists(select 1 from public.curriculum_modules m join public.curriculum_releases r on r.id=m.release_id where m.id=e.module_id and m.catalog_mode='published' and r.status='verified') then raise exception 'Exam content unavailable'; end if;
 if e.max_attempts>0 and (select count(*) from public.training_attempts where user_id=auth.uid() and exam_definition_id=e.id)>=e.max_attempts then raise exception 'Attempt limit reached'; end if;
 select jsonb_agg(q) into qs from (select value q from public.training_catalog c cross join lateral jsonb_array_elements(c.questions) where c.module_id=e.module_id order by random() limit e.question_count) selected;
 if coalesce(jsonb_array_length(qs),0)<>e.question_count then raise exception 'Insufficient published questions'; end if;
 select jsonb_agg((q-'explanation')||jsonb_build_object('options',(select jsonb_agg(o-'isCorrect') from jsonb_array_elements(q->'options') o))) into safe_qs from jsonb_array_elements(qs) q;
 insert into public.training_attempts(id,user_id,module_id,module_name,mode,questions,question_count,deadline_at,exam_definition_id,rule_snapshot)
 values(p_id,auth.uid(),e.module_id,e.title,'exam',safe_qs,e.question_count,now()+make_interval(secs=>e.duration_seconds),e.id,
 jsonb_build_object('scoring',e.scoring,'duration_seconds',e.duration_seconds,'max_attempts',e.max_attempts,'corrections','after_submission')) returning * into a;
 insert into medqcm_private.exam_keys values(a.id,qs); return a;
end; $$;

-- Use the persisted deadline for configured exams, rather than the old 90s-per-question cap.
create or replace function public.finish_training_attempt(p_id uuid,p_answers jsonb)
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
 update public.training_attempts set completed_at=least(completed_at,deadline_at),duration_seconds=least(duration_seconds,greatest(0,extract(epoch from deadline_at-started_at)::integer)) where id=p_id returning * into a;
 end if;return a;
end; $$;

create function public.published_exams() returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',e.id,'module_id',e.module_id,'module_name',e.title,'question_count',e.question_count,'duration_seconds',e.duration_seconds,'max_attempts',e.max_attempts,'accessible',public.can_access_module(e.module_id)) order by e.title),'[]')
 from public.exam_definitions e join public.curriculum_modules m on m.id=e.module_id join public.curriculum_releases r on r.id=m.release_id join public.training_catalog c on c.module_id=m.id
 where auth.uid() is not null and e.status='published' and m.active and m.catalog_mode='published' and r.status='verified' and jsonb_array_length(c.questions)>=e.question_count;
$$;
revoke all on function public.can_access_module(text),public.subscription_options(),public.manage_offer(text,jsonb),public.submit_scoped_receipt(uuid,uuid,integer,text,text,text,text),public.manage_exam(text,jsonb),public.start_configured_exam(uuid,uuid),public.published_exams() from public,anon;
grant execute on function public.can_access_module(text),public.subscription_options(),public.manage_offer(text,jsonb),public.submit_scoped_receipt(uuid,uuid,integer,text,text,text,text),public.manage_exam(text,jsonb),public.start_configured_exam(uuid,uuid),public.published_exams() to authenticated;
commit;
