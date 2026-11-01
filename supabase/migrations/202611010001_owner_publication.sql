-- Explicit owner-approved practice publication; does not attest independent medical review.
begin;
alter table public.question_versions add column approval_basis text not null default 'independent' check(approval_basis in ('independent','owner'));
alter table public.question_versions add column owner_approved_by uuid references auth.users;
alter table public.question_versions add column owner_approved_at timestamptz;
alter table public.question_versions add column owner_approval_note text not null default '';
do $$declare n text; begin
 select conname into strict n from pg_constraint where conrelid='public.question_versions'::regclass and contype='c' and pg_get_constraintdef(oid) like '%reviewer_id%';
 execute format('alter table public.question_versions drop constraint %I',n);
end $$;
alter table public.question_versions add constraint question_publication_approval check(
 status not in ('approved','published') or
 (approval_basis='independent' and reviewer_id is not null and reviewer_id is distinct from author_id and reviewed_at is not null and length(trim(rights_reference))>=3) or
 (status='published' and approval_basis='owner' and owner_approved_by is not null and owner_approved_at is not null and length(trim(owner_approval_note))>=10 and reviewer_id is null and reviewed_at is null)
);

create or replace function public.manage_question(p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.question_versions; q public.content_questions; mid text; vid uuid; qid uuid;
begin

 if p_action='publish_owner' then
 if not exists(select 1 from auth.users where id=auth.uid() and raw_app_meta_data->>'role'='admin') then raise exception 'Owner administrator required'; end if;
 if length(trim(coalesce(p_data->>'note','')))<10 then raise exception 'Owner publication note required'; end if;
 select * into v from public.question_versions where id=(p_data->>'id')::uuid for update;
 if not found or v.status<>'draft' then raise exception 'Draft required'; end if;
 if v.review_note like '%Contrôle extraction%' then raise exception 'Resolve extraction flags before publication'; end if;
 perform medqcm_private.validate_question(v.payload);
 select * into q from public.content_questions where id=v.question_id;
 if not exists(select 1 from public.curriculum_modules m join public.curriculum_releases r on r.id=m.release_id where m.id=q.module_id and m.active and r.status<>'archived') then raise exception 'Active curriculum required'; end if;
 update public.question_versions set status='superseded' where question_id=q.id and status='published';
 update public.question_versions set status='published',approval_basis='owner',owner_approved_by=auth.uid(),owner_approved_at=now(),owner_approval_note=p_data->>'note',reviewer_id=null,reviewed_at=null,updated_at=now() where id=v.id returning * into v;
 update public.curriculum_modules set catalog_mode='published' where id=q.module_id;
 perform medqcm_private.sync_catalog(q.module_id);
 perform medqcm_private.audit('question.publish_owner',v.id::text,jsonb_build_object('note',p_data->>'note','independent_review',false));
 return to_jsonb(v);
 end if;
 if not (public.has_staff_capability('edit') or public.has_staff_capability('review')) then raise exception 'Staff required'; end if;
 if p_action='create' then
 if not public.has_staff_capability('edit') then raise exception 'Editor required'; end if;
 mid:=p_data->>'module_id';
 if nullif(p_data->>'question_id','') is not null then
 select * into q from public.content_questions where id=(p_data->>'question_id')::uuid for update;
 if not found or q.module_id<>mid then raise exception 'Question unavailable'; end if;
 else
 insert into public.content_questions(module_id,legacy_key) values(mid,'q-'||gen_random_uuid()) returning * into q;
 end if;
 insert into public.question_versions(question_id,version,payload,author_id)
 values(q.id,(select coalesce(max(version),0)+1 from public.question_versions where question_id=q.id),coalesce((select payload from public.question_versions where question_id=q.id order by version desc limit 1),'{}'),auth.uid()) returning * into v;
 else
 select * into v from public.question_versions where id=(p_data->>'id')::uuid for update;
 if not found then raise exception 'Version unavailable'; end if;
 select * into q from public.content_questions where id=v.question_id for update; mid:=q.module_id;
 if p_action='save' then
 if not public.has_staff_capability('edit') or v.status not in ('draft','rejected') then raise exception 'Version is not editable'; end if;
 perform medqcm_private.validate_question(p_data->'payload');
 if nullif(p_data->>'course_id','') is not null and not exists(select 1 from public.curriculum_courses where id=(p_data->>'course_id')::uuid and module_id=mid and active) then raise exception 'Invalid course'; end if;
 update public.question_versions set payload=(p_data->'payload')||jsonb_build_object('id',q.legacy_key),course_id=nullif(p_data->>'course_id','')::uuid,
 rights_reference=coalesce(p_data->>'rights_reference',''),author_id=auth.uid(),status='draft',reviewer_id=null,reviewed_at=null,updated_at=now() where id=v.id returning * into v;
 elsif p_action='submit' then
 if not public.has_staff_capability('edit') or v.status<>'draft' then raise exception 'Draft required'; end if;
 perform medqcm_private.validate_question(v.payload);
 if length(trim(v.rights_reference))<3 or length(trim(coalesce(v.payload->>'explanation','')))<3 then raise exception 'Source permission and explanation required'; end if;
 update public.question_versions set status='in_review',updated_at=now() where id=v.id returning * into v;
 elsif p_action in ('approve','reject') then
 if not public.has_staff_capability('review') or v.status<>'in_review' or v.author_id=auth.uid() then raise exception 'Independent medical reviewer required'; end if;
 if length(trim(coalesce(p_data->>'note','')))<3 then raise exception 'Review note required'; end if;
 update public.question_versions set status=case when p_action='approve' then 'approved' else 'rejected' end,
 reviewer_id=auth.uid(),reviewed_at=now(),review_note=p_data->>'note',updated_at=now() where id=v.id returning * into v;
 elsif p_action='publish' then
 if not public.has_staff_capability('review') or v.status<>'approved' then raise exception 'Approved version required'; end if;
 if not exists(select 1 from public.curriculum_modules m join public.curriculum_releases r on r.id=m.release_id where m.id=mid and m.active and r.status='verified') then raise exception 'Verify the programme before publishing'; end if;
 update public.question_versions set status='superseded' where question_id=q.id and status='published';
 update public.question_versions set status='published',updated_at=now() where id=v.id returning * into v;
 update public.curriculum_modules set catalog_mode='published' where id=mid;
 perform medqcm_private.sync_catalog(mid);
 elsif p_action='withdraw' then
 if not public.has_staff_capability('review') or v.status not in ('published','superseded') or length(trim(coalesce(p_data->>'note','')))<3 then raise exception 'Withdrawal reason required'; end if;
 update public.question_versions set status='withdrawn',updated_at=now() where id=v.id returning * into v;
 insert into public.content_notices(version_id,reason) values(v.id,p_data->>'note');
 perform medqcm_private.sync_catalog(mid);
 else raise exception 'Unknown question action'; end if;
 end if;
 perform medqcm_private.audit('question.'||p_action,v.id::text,jsonb_build_object('question_id',v.question_id,'note',p_data->>'note'));
 return to_jsonb(v);
end; $$;
create or replace function public.curriculum_overview() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('releases',coalesce((select jsonb_agg(to_jsonb(r) order by r.title) from public.curriculum_releases r where r.status<>'archived' or public.has_staff_capability('edit') or public.has_staff_capability('review')),'[]'),
 'modules',coalesce((select jsonb_agg(to_jsonb(m)||jsonb_build_object('question_count',coalesce(jsonb_array_length(c.questions),0),'reviewed',m.catalog_mode='published' and coalesce(jsonb_array_length(c.questions),0)>0 and not exists(select 1 from public.content_questions oq join public.question_versions ov on ov.question_id=oq.id where oq.module_id=m.id and ov.status='published' and ov.approval_basis='owner')) order by m.study_year,m.category,m.title)
 from public.curriculum_modules m join public.curriculum_releases r on r.id=m.release_id left join public.training_catalog c on c.module_id=m.id where (m.active and r.status<>'archived') or public.has_staff_capability('edit') or public.has_staff_capability('review')),'[]'),
 'courses',coalesce((select jsonb_agg(to_jsonb(c) order by c.title) from public.curriculum_courses c join public.curriculum_modules m on m.id=c.module_id join public.curriculum_releases r on r.id=m.release_id where (c.active and m.active and r.status<>'archived') or public.has_staff_capability('edit') or public.has_staff_capability('review')),'[]')) where auth.uid() is not null;
$$;
create or replace function public.admin_overview_metrics() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.is_medqcm_admin() then raise exception 'Admin required'; end if;
 return jsonb_build_object(
 'registered_accounts',(select count(*) from auth.users),
 'sample_questions',(select count(*) from public.question_versions v join public.content_questions q on q.id=v.question_id join public.curriculum_modules m on m.id=q.module_id where v.status='sample' and m.catalog_mode='sample'),
 'reviewed_questions',(select count(*) from public.question_versions where status='published' and approval_basis='independent'),
 'private_drafts',(select count(*) from public.question_versions where status in ('draft','in_review','approved','rejected')),
 'pending_receipts',(select count(*) from public.receipt_requests where status='pending'),
 'active_subscriptions',(select count(distinct user_id) from public.access_grants where revoked_at is null and starts_at<=now() and ends_at>now()));
end; $$;
create or replace function public.manage_exam(p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
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
 where m.id=e.module_id and m.active and r.status='verified' and m.catalog_mode='published' and not exists(select 1 from public.content_questions oq join public.question_versions ov on ov.question_id=oq.id where oq.module_id=m.id and ov.status='published' and ov.approval_basis='owner') and jsonb_array_length(c.questions)>=e.question_count) then raise exception 'Insufficient published content or unverified curriculum'; end if;
 update public.exam_definitions set status='published',reviewed_by=auth.uid(),reviewed_at=now(),review_note=p_data->>'note' where id=e.id returning * into e;
 else update public.exam_definitions set status='retired' where id=e.id returning * into e; end if;
 else raise exception 'Unknown exam action'; end if;
 perform medqcm_private.audit('exam.'||p_action,e.id::text); return to_jsonb(e);
end; $$;
create or replace function public.start_configured_exam(p_id uuid,p_exam uuid) returns public.training_attempts language plpgsql security definer set search_path='' as $$
declare e public.exam_definitions; a public.training_attempts; qs jsonb; safe_qs jsonb;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select * into a from public.training_attempts where id=p_id;
 if found then if a.user_id<>auth.uid() or a.exam_definition_id is distinct from p_exam then raise exception 'Attempt unavailable'; end if;return a;end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_exam::text,4));
 select * into e from public.exam_definitions where id=p_exam and status='published';
 if not found or not public.can_access_module(e.module_id) then raise exception 'Exam unavailable'; end if;
 if not exists(select 1 from public.curriculum_modules m join public.curriculum_releases r on r.id=m.release_id where m.id=e.module_id and m.catalog_mode='published' and not exists(select 1 from public.content_questions oq join public.question_versions ov on ov.question_id=oq.id where oq.module_id=m.id and ov.status='published' and ov.approval_basis='owner') and r.status='verified') then raise exception 'Exam content unavailable'; end if;
 if e.max_attempts>0 and (select count(*) from public.training_attempts where user_id=auth.uid() and exam_definition_id=e.id)>=e.max_attempts then raise exception 'Attempt limit reached'; end if;
 select jsonb_agg(q) into qs from (select value q from public.training_catalog c cross join lateral jsonb_array_elements(c.questions) where c.module_id=e.module_id order by random() limit e.question_count) selected;
 if coalesce(jsonb_array_length(qs),0)<>e.question_count then raise exception 'Insufficient published questions'; end if;
 select jsonb_agg((q-'explanation')||jsonb_build_object('options',(select jsonb_agg(o-'isCorrect') from jsonb_array_elements(q->'options') o))) into safe_qs from jsonb_array_elements(qs) q;
 insert into public.training_attempts(id,user_id,module_id,module_name,mode,questions,question_count,deadline_at,exam_definition_id,rule_snapshot)
 values(p_id,auth.uid(),e.module_id,e.title,'exam',safe_qs,e.question_count,now()+make_interval(secs=>e.duration_seconds),e.id,
 jsonb_build_object('scoring',e.scoring,'duration_seconds',e.duration_seconds,'max_attempts',e.max_attempts,'corrections','after_submission')) returning * into a;
 insert into medqcm_private.exam_keys values(a.id,qs); return a;
end; $$;
commit;
