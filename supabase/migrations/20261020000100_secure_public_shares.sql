create extension if not exists pgcrypto;

create table if not exists public.public_shares (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  profile jsonb not null check (jsonb_typeof(profile) = 'object'),
  fields text[] not null check (cardinality(fields) > 0 and 'name' = any(fields)),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  schema_version integer not null default 1,
  constraint public_shares_expiry_window check (expires_at > created_at)
);

create index if not exists public_shares_owner_created_idx
  on public.public_shares (owner_id, created_at desc);
create index if not exists public_shares_expiry_idx
  on public.public_shares (expires_at) where revoked_at is null;

alter table public.public_shares enable row level security;
-- Deliberately no anon/authenticated policies. All access goes through the
-- Edge Function using the service-role key after explicit authorization.

create table if not exists public.share_rate_limits (
  rate_key text not null,
  minute_bucket bigint not null,
  request_count integer not null default 0 check (request_count >= 0),
  primary key (rate_key, minute_bucket)
);
alter table public.share_rate_limits enable row level security;

create or replace function public.consume_share_rate_limit(
  p_rate_key text, p_minute_bucket bigint, p_limit integer default 60
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  insert into public.share_rate_limits (rate_key, minute_bucket, request_count)
  values (p_rate_key, p_minute_bucket, 1)
  on conflict (rate_key, minute_bucket) do update
    set request_count = public.share_rate_limits.request_count + 1
    where public.share_rate_limits.request_count < p_limit
  returning request_count into v_count;

  return v_count is not null;
end;
$$;

revoke all on function public.consume_share_rate_limit(text, bigint, integer) from public, anon, authenticated;
grant execute on function public.consume_share_rate_limit(text, bigint, integer) to service_role;
