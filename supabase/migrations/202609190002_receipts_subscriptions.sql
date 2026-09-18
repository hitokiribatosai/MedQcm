begin;
create table public.payment_configuration (
 id boolean primary key default true check(id), accepting_payments boolean not null default false,
 instructions text not null default '', annual_days integer not null default 365 check(annual_days>0), semester_days integer not null default 180 check(semester_days>0)
);
insert into public.payment_configuration default values;
alter table public.payment_configuration enable row level security;
revoke all on public.payment_configuration from anon,authenticated;
grant select on public.payment_configuration to authenticated;
create policy payment_configuration_read on public.payment_configuration for select to authenticated using(true);
create table public.receipt_requests (
 id uuid primary key, user_id uuid not null references auth.users(id), plan text not null check(plan in('annual','semester')),
 amount integer not null check(amount>0), duration_days integer not null check(duration_days>0),
 proof_path text not null unique, transaction_reference text not null, note text not null default '',
 status text not null default 'pending' check(status in('pending','approved','rejected')),
 created_at timestamptz not null default now(), reviewed_at timestamptz, reviewed_by uuid references auth.users(id),admin_note text not null default ''
);
create unique index one_pending_receipt_per_user on public.receipt_requests(user_id) where status='pending';
create index receipt_queue on public.receipt_requests(status,created_at);
alter table public.receipt_requests enable row level security;
revoke all on public.receipt_requests from anon,authenticated;
grant select on public.receipt_requests to authenticated;
create function public.is_medqcm_admin() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from auth.users where id=auth.uid() and raw_app_meta_data->>'role'='admin'); $$;
revoke all on function public.is_medqcm_admin() from public,anon;
grant execute on function public.is_medqcm_admin() to authenticated;
create policy receipt_owner_or_admin on public.receipt_requests for select to authenticated using(user_id=(select auth.uid()) or (select public.is_medqcm_admin()));
create table public.subscription_entitlements (
 user_id uuid primary key references auth.users(id), expires_at timestamptz not null, updated_at timestamptz not null default now()
);
alter table public.subscription_entitlements enable row level security;
revoke all on public.subscription_entitlements from anon,authenticated;
grant select on public.subscription_entitlements to authenticated;
create policy entitlement_read on public.subscription_entitlements for select to authenticated using(user_id=(select auth.uid()) or (select public.is_medqcm_admin()));
create function public.has_medqcm_subscription() returns boolean language sql stable security definer set search_path='' as $$ select public.is_medqcm_admin() or exists(select 1 from public.subscription_entitlements where user_id=auth.uid() and expires_at>now()); $$;
revoke all on function public.has_medqcm_subscription() from public,anon;
grant execute on function public.has_medqcm_subscription() to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('payment-receipts','payment-receipts',false,5242880,array['image/jpeg','image/png','application/pdf']);
create policy receipt_upload on storage.objects for insert to authenticated with check(bucket_id='payment-receipts' and (storage.foldername(name))[1]=auth.uid()::text and (select accepting_payments from public.payment_configuration where id=true));
create policy receipt_read on storage.objects for select to authenticated using(bucket_id='payment-receipts' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_medqcm_admin()));
-- No overwrite/delete permission: submitted proofs stay immutable for review.

create function public.submit_receipt(p_id uuid,p_plan text,p_path text,p_reference text,p_note text)
returns public.receipt_requests language plpgsql security definer set search_path='' as $$
declare r public.receipt_requests; config public.payment_configuration;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,1));
 select * into r from public.receipt_requests where id=p_id;
 if found then if r.user_id<>auth.uid() then raise exception 'Unavailable'; end if;return r;end if;
 select * into config from public.payment_configuration where id=true;
 if not config.accepting_payments or btrim(config.instructions)='' then raise exception 'Payments closed'; end if;
 if p_plan is null or p_plan not in('annual','semester') or length(btrim(p_reference))<3 or length(p_reference)>200 or length(p_note)>2000 then raise exception 'Invalid request'; end if;
 if split_part(p_path,'/',1)<>auth.uid()::text or split_part(p_path,'/',2)<>p_id::text or not exists(select 1 from storage.objects where bucket_id='payment-receipts' and name=p_path) then raise exception 'Receipt unavailable'; end if;
 insert into public.receipt_requests(id,user_id,plan,amount,duration_days,proof_path,transaction_reference,note)
 values(p_id,auth.uid(),p_plan,case when p_plan='annual' then 4500 else 2800 end,case when p_plan='annual' then config.annual_days else config.semester_days end,p_path,btrim(p_reference),coalesce(p_note,'')) returning * into r;
 return r;
end; $$;
create function public.review_receipt(p_id uuid,p_decision text,p_note text)
returns public.receipt_requests language plpgsql security definer set search_path='' as $$
declare r public.receipt_requests;
begin
 if not public.is_medqcm_admin() then raise exception 'Admin required'; end if;
 if p_decision is null or p_decision not in('approved','rejected') or length(p_note)>2000 then raise exception 'Invalid decision'; end if;
 select * into r from public.receipt_requests where id=p_id for update;
 if not found then raise exception 'Request unavailable'; end if;
 if r.status<>'pending' then
  if r.status<>p_decision then raise exception 'Already reviewed'; end if;
  return r;
 end if;
 if p_decision='approved' then
  insert into public.subscription_entitlements(user_id,expires_at) values(r.user_id,now()+make_interval(days=>r.duration_days))
  on conflict(user_id) do update set expires_at=greatest(now(),public.subscription_entitlements.expires_at)+make_interval(days=>r.duration_days),updated_at=now();
 end if;
 update public.receipt_requests set status=p_decision,admin_note=coalesce(p_note,''),reviewed_at=now(),reviewed_by=auth.uid() where id=p_id returning * into r;
 return r;
end; $$;
revoke all on function public.submit_receipt(uuid,text,text,text,text),public.review_receipt(uuid,text,text) from public,anon;
grant execute on function public.submit_receipt(uuid,text,text,text,text),public.review_receipt(uuid,text,text) to authenticated;

alter table public.training_catalog add column requires_subscription boolean not null default false;
-- Enforce entitlement even on direct RPC calls, not just the page UI.
alter function public.start_training_attempt(uuid,text,text,integer,boolean) rename to start_training_attempt_with_recovery;
revoke all on function public.start_training_attempt_with_recovery(uuid,text,text,integer,boolean) from public,anon,authenticated;
create function public.start_training_attempt(p_id uuid,p_module text,p_mode text,p_count integer,p_sample boolean default false)
returns public.training_attempts language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.training_catalog where module_id=p_module and requires_subscription) and not public.has_medqcm_subscription() then raise exception 'Subscription required'; end if;
 return public.start_training_attempt_with_recovery(p_id,p_module,p_mode,p_count,p_sample);
end; $$;
revoke all on function public.start_training_attempt(uuid,text,text,integer,boolean) from public,anon;
grant execute on function public.start_training_attempt(uuid,text,text,integer,boolean) to authenticated;
commit;
