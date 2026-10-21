begin;
create table public.course_documents (
 id uuid primary key default gen_random_uuid(), module_id text not null references public.curriculum_modules,
 course_id uuid, title text not null check(length(trim(title)) between 3 and 200), professor text not null default '', faculty text not null default '',
 source_reference text not null check(length(trim(source_reference)) between 3 and 500), rights_reference text not null check(length(trim(rights_reference)) between 3 and 1000),
 object_path text not null unique, size_bytes integer not null check(size_bytes between 1 and 26214400),
 status text not null default 'awaiting_upload' check(status in ('awaiting_upload','scanning','scan_failed','in_review','published','rejected','withdrawn')),
 author_id uuid not null references auth.users, reviewer_id uuid references auth.users, review_note text not null default '', reviewed_at timestamptz,
 scan_sha256 text, scan_engine text, scanned_at timestamptz, created_at timestamptz not null default now(),
 foreign key(course_id,module_id) references public.curriculum_courses(id,module_id),
 check(status<>'published' or (scan_sha256 is not null and scanned_at is not null and reviewer_id is not null and reviewer_id<>author_id and reviewed_at is not null))
);
create table medqcm_private.document_jobs (
 document_id uuid primary key references public.course_documents, attempts integer not null default 0,
 available_at timestamptz not null default now(), lease_id uuid, leased_until timestamptz, finished_at timestamptz,
 last_error text
);
alter table public.course_documents enable row level security;
revoke all on public.course_documents from public,anon,authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('course-documents','course-documents',false,26214400,array['application/pdf']);
create function public.can_upload_document(p_path text) returns boolean language sql stable security definer set search_path='' as $$
 select public.has_staff_capability('edit') and exists(select 1 from public.course_documents d where d.object_path=p_path and d.author_id=auth.uid() and d.status='awaiting_upload');
$$;
create function public.can_read_document(p_path text) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.course_documents d where d.object_path=p_path and (
 (d.scanned_at is not null and d.status in ('in_review','published','rejected','withdrawn') and (public.has_staff_capability('edit') or public.has_staff_capability('review')))
 or (d.status='published' and public.can_access_module(d.module_id))));
$$;
create policy course_document_upload on storage.objects for insert to authenticated with check(bucket_id='course-documents' and public.can_upload_document(name));
create policy course_document_read on storage.objects for select to authenticated using(bucket_id='course-documents' and public.can_read_document(name));
-- No authenticated update/delete policy: uploaded bytes cannot change after scanning.

create table medqcm_private.request_budgets (
 user_id uuid not null, bucket text not null, window_start timestamptz not null, requests integer not null,
 primary key(user_id,bucket)
);
create function medqcm_private.consume_budget(p_bucket text,p_limit integer) returns void language plpgsql set search_path='' as $$
declare n integer;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 insert into medqcm_private.request_budgets(user_id,bucket,window_start,requests) values(auth.uid(),p_bucket,date_trunc('minute',now()),1)
 on conflict(user_id,bucket) do update set
 requests=case when request_budgets.window_start=date_trunc('minute',now()) then request_budgets.requests+1 else 1 end,window_start=date_trunc('minute',now()) returning requests into n;
 if n>p_limit then raise exception 'Too many requests; wait one minute'; end if;
end; $$;
create function medqcm_private.limit_mutation() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is not null then perform medqcm_private.consume_budget(tg_table_name,case when tg_table_name='training_attempts' then 240 else 30 end); end if;
 return new;
end; $$;
create trigger limit_attempt_mutations before insert or update on public.training_attempts for each row execute function medqcm_private.limit_mutation();
create trigger limit_report_mutations before insert on public.question_reports for each row execute function medqcm_private.limit_mutation();
create trigger limit_receipt_mutations before insert on public.receipt_requests for each row execute function medqcm_private.limit_mutation();
create trigger limit_document_mutations before insert on public.course_documents for each row execute function medqcm_private.limit_mutation();

create function public.manage_document(p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.course_documents; did uuid;
begin
 if p_action='create' then
 if not public.has_staff_capability('edit') then raise exception 'Editor required'; end if;
 if (select count(*) from public.course_documents where author_id=auth.uid() and status in ('awaiting_upload','scanning','scan_failed'))>=10 then raise exception 'Finish pending uploads before adding more'; end if;
 did:=gen_random_uuid();
 insert into public.course_documents(id,module_id,course_id,title,professor,faculty,source_reference,rights_reference,object_path,size_bytes,author_id)
 values(did,p_data->>'module_id',nullif(p_data->>'course_id','')::uuid,p_data->>'title',coalesce(p_data->>'professor',''),coalesce(p_data->>'faculty',''),p_data->>'source_reference',p_data->>'rights_reference',auth.uid()::text||'/'||did::text||'/document.pdf',(p_data->>'size_bytes')::integer,auth.uid()) returning * into d;
 else
 select * into d from public.course_documents where id=(p_data->>'id')::uuid for update;
 if not found then raise exception 'Document unavailable'; end if;
 if p_action='uploaded' then
 if not public.has_staff_capability('edit') or d.author_id<>auth.uid() or d.status<>'awaiting_upload' then raise exception 'Upload unavailable'; end if;
 if not exists(select 1 from storage.objects where bucket_id='course-documents' and name=d.object_path) then raise exception 'Upload the file first'; end if;
 update public.course_documents set status='scanning' where id=d.id returning * into d;
 insert into medqcm_private.document_jobs(document_id) values(d.id);
 elsif p_action='retry_scan' then
 if not public.has_staff_capability('edit') or d.status<>'scan_failed' then raise exception 'Scan retry unavailable'; end if;
 update public.course_documents set status='scanning' where id=d.id returning * into d;
 update medqcm_private.document_jobs set attempts=0,finished_at=null,lease_id=null,leased_until=null,available_at=now() where document_id=d.id;
 elsif p_action in ('publish','reject','withdraw') then
 if not public.has_staff_capability('review') or length(trim(coalesce(p_data->>'note','')))<3 then raise exception 'Reviewer and note required'; end if;
 if p_action='withdraw' then
 if d.status<>'published' then raise exception 'Published document required'; end if;
 update public.course_documents set status='withdrawn',review_note=p_data->>'note' where id=d.id returning * into d;
 else
 if d.status<>'in_review' or d.author_id=auth.uid() then raise exception 'Independent review required after scanning'; end if;
 if p_action='publish' and not exists(select 1 from public.curriculum_modules m join public.curriculum_releases r on r.id=m.release_id where m.id=d.module_id and m.active and r.status='verified') then raise exception 'Verify the curriculum first'; end if;
 update public.course_documents set status=case when p_action='publish' then 'published' else 'rejected' end,reviewer_id=auth.uid(),reviewed_at=now(),review_note=p_data->>'note' where id=d.id returning * into d;
 end if;
 else raise exception 'Unknown document action'; end if;
 end if;
 perform medqcm_private.audit('document.'||p_action,d.id::text,jsonb_build_object('note',p_data->>'note')); return to_jsonb(d);
end; $$;

-- Only trusted workers may claim a scan and attest its outcome; a user cannot self-attest.
create function public.claim_document_job() returns jsonb language plpgsql security definer set search_path='' as $$
declare j medqcm_private.document_jobs;
begin
 update public.course_documents d set status='scan_failed' from medqcm_private.document_jobs expired_job
 where d.id=expired_job.document_id and d.status='scanning' and expired_job.finished_at is null and expired_job.attempts>=5 and expired_job.leased_until<now();
 update medqcm_private.document_jobs set finished_at=now() where finished_at is null and attempts>=5 and leased_until<now();
 select * into j from medqcm_private.document_jobs where finished_at is null and available_at<=now() and (leased_until is null or leased_until<now()) and attempts<5 order by available_at for update skip locked limit 1;
 if not found then return null; end if;
 update medqcm_private.document_jobs set attempts=attempts+1,lease_id=gen_random_uuid(),leased_until=now()+interval '10 minutes' where document_id=j.document_id returning * into j;
 return (select jsonb_build_object('id',d.id,'path',d.object_path,'size_bytes',d.size_bytes,'lease',j.lease_id) from public.course_documents d where d.id=j.document_id);
end; $$;
create function public.finish_document_job(p_id uuid,p_lease uuid,p_clean boolean,p_hash text,p_engine text,p_error text) returns void language plpgsql security definer set search_path='' as $$
declare j medqcm_private.document_jobs;
begin
 select * into j from medqcm_private.document_jobs where document_id=p_id for update;
 if not found or j.lease_id is distinct from p_lease or j.finished_at is not null or j.leased_until<now() then raise exception 'Job lease expired'; end if;
 if p_clean and (p_hash !~ '^[a-f0-9]{64}$' or p_hash is null or length(coalesce(p_engine,''))<3) then raise exception 'Scan evidence required'; end if;
 if p_clean then
 update public.course_documents set status='in_review',scan_sha256=p_hash,scan_engine=p_engine,scanned_at=now() where id=p_id and status='scanning';
 update medqcm_private.document_jobs set finished_at=now(),leased_until=null where document_id=p_id;
 else
 update medqcm_private.document_jobs set last_error=left(p_error,500),leased_until=null,lease_id=null,available_at=now()+interval '5 minutes',finished_at=case when attempts>=5 then now() end where document_id=p_id;
 if j.attempts>=5 then update public.course_documents set status='scan_failed' where id=p_id;end if;
 end if;
end; $$;
revoke all on function public.claim_document_job(),public.finish_document_job(uuid,uuid,boolean,text,text,text) from public,anon,authenticated;
grant execute on function public.claim_document_job(),public.finish_document_job(uuid,uuid,boolean,text,text,text) to service_role;

create function public.document_library() returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',d.id,'module_id',d.module_id,'course_id',d.course_id,'title',d.title,'professor',d.professor,'faculty',d.faculty,'size_bytes',d.size_bytes,'accessible',public.can_access_module(d.module_id)) order by d.title),'[]')
 from public.course_documents d join public.curriculum_modules m on m.id=d.module_id join public.curriculum_releases r on r.id=m.release_id where auth.uid() is not null and d.status='published' and m.active and r.status<>'archived';
$$;
create function public.document_download_path(p_id uuid) returns text language plpgsql security definer set search_path='' as $$
declare path text;
begin
 select object_path into path from public.course_documents where id=p_id;
 if path is null or not public.can_read_document(path) then raise exception 'Document access required'; end if;
 return path;
end; $$;

create function public.admin_workspace(p_section text,p_offset integer default 0) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;
begin
 if p_offset<0 or p_offset>100000 then raise exception 'Invalid offset'; end if;
 if p_section in ('questions','documents','exams','curriculum') then
 if not(public.has_staff_capability('edit') or public.has_staff_capability('review')) then raise exception 'Content staff required';end if;
 elsif p_section='offers' then
 if not public.has_staff_capability('payments') then raise exception 'Payment manager required';end if;
 elsif p_section='audit' then
 if not public.is_medqcm_admin() then raise exception 'Admin required';end if;
 else raise exception 'Unknown workspace';end if;
 if p_section='curriculum' then return public.curriculum_overview();
 elsif p_section='questions' then
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from (select v.*,q.module_id,q.legacy_key from public.question_versions v join public.content_questions q on q.id=v.question_id order by v.created_at desc,v.id limit 50 offset p_offset) t;
 elsif p_section='documents' then
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from (select * from public.course_documents order by created_at desc,id limit 50 offset p_offset) t;
 elsif p_section='exams' then
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from (select * from public.exam_definitions order by title,id limit 50 offset p_offset) t;
 elsif p_section='offers' then
 return jsonb_build_object('options',public.subscription_options(),'periods',coalesce((select jsonb_agg(to_jsonb(p) order by starts_at desc) from public.academic_periods p),'[]'));
 elsif p_section='audit' then
 select coalesce(jsonb_agg(to_jsonb(t)),'[]') into result from (select * from public.content_audit order by id desc limit 50 offset p_offset) t;
 end if; return result;
end; $$;
create function public.schema_health() returns text language sql stable security definer set search_path='' as $$select '202610200003';$$;
revoke all on function public.schema_health() from public;
grant execute on function public.schema_health() to anon,authenticated,service_role;
revoke all on function public.can_upload_document(text),public.can_read_document(text),public.manage_document(text,jsonb),public.document_library(),public.document_download_path(uuid),public.admin_workspace(text,integer) from public,anon;
grant execute on function public.can_upload_document(text),public.can_read_document(text),public.manage_document(text,jsonb),public.document_library(),public.document_download_path(uuid),public.admin_workspace(text,integer) to authenticated;
create or replace function public.admin_overview_metrics() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not public.is_medqcm_admin() then raise exception 'Admin required'; end if;
 return jsonb_build_object(
 'registered_accounts',(select count(*) from auth.users),
 'sample_questions',(select count(*) from public.question_versions v join public.content_questions q on q.id=v.question_id join public.curriculum_modules m on m.id=q.module_id where v.status='sample' and m.catalog_mode='sample'),
 'reviewed_questions',(select count(*) from public.question_versions where status='published'),
 'private_drafts',(select count(*) from public.question_versions where status in ('draft','in_review','approved','rejected')),
 'pending_receipts',(select count(*) from public.receipt_requests where status='pending'),
 'active_subscriptions',(select count(distinct user_id) from public.access_grants where revoked_at is null and starts_at<=now() and ends_at>now()));
end; $$;
commit;
