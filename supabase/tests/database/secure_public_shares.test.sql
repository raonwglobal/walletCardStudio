begin;

create extension if not exists pgtap with schema extensions;
select plan(10);

select ok(
  to_regclass('public.public_shares') is not null,
  'public_shares table exists'
);

select ok(
  to_regclass('public.share_rate_limits') is not null,
  'share_rate_limits table exists'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.public_shares'::regclass),
  'RLS is enabled on public_shares'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.share_rate_limits'::regclass),
  'RLS is enabled on share_rate_limits'
);

select ok(
  not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'public_shares'),
  'public_shares has no direct client policies'
);

select ok(
  not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'share_rate_limits'),
  'share_rate_limits has no direct client policies'
);

select ok(
  not has_table_privilege('anon', 'public.public_shares', 'select'),
  'anon cannot select public_shares directly'
);

select ok(
  not has_table_privilege('authenticated', 'public.public_shares', 'select'),
  'authenticated cannot select public_shares directly'
);

select ok(
  has_function_privilege('service_role', 'public.consume_share_rate_limit(text,bigint,integer)', 'execute'),
  'service_role can execute the rate-limit function'
);

select ok(
  (select prosecdef from pg_proc where oid = 'public.consume_share_rate_limit(text,bigint,integer)'::regprocedure),
  'rate-limit function uses SECURITY DEFINER'
);

select * from finish();
rollback;
