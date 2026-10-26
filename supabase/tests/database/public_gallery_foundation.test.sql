begin;
select plan(10);

select has_table('public', 'gallery_publications', 'gallery publication table exists');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.gallery_publications'::regclass),
  'RLS is enabled on gallery publications'
);
select ok(
  has_column_privilege('anon', 'public.gallery_publications', 'title', 'SELECT')
    and has_column_privilege('anon', 'public.gallery_publications', 'card_data', 'SELECT'),
  'anonymous users can read approved public gallery fields'
);
select ok(
  not has_column_privilege('anon', 'public.gallery_publications', 'owner_id', 'SELECT'),
  'anonymous users cannot read publication owner IDs'
);
select ok(
  not has_table_privilege('anon', 'public.gallery_publications', 'INSERT'),
  'anonymous users cannot publish content'
);
select ok(
  has_column_privilege('authenticated', 'public.gallery_publications', 'owner_id', 'INSERT'),
  'authenticated users can submit owner ID for ownership policy validation'
);
select ok(
  not has_table_privilege('authenticated', 'public.gallery_publications', 'UPDATE'),
  'authenticated users do not have unrestricted table-level update grants'
);
select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'gallery_publications'
      and policyname = 'gallery_publications_insert_owner'
      and with_check like '%auth.uid%'
  ),
  'insert policy binds publication owner to auth.uid()'
);
select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'gallery_publications'
      and policyname = 'gallery_publications_update_owner'
      and qual like '%auth.uid%'
  ),
  'update policy restricts edits to the owner'
);
select ok(
  exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'gallery_publications'
      and indexname = 'gallery_publications_public_feed_idx'
  ),
  'published feed has a partial index'
);

select * from finish();
rollback;
