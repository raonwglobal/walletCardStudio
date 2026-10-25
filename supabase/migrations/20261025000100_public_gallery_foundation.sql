-- Public gallery foundation: user-controlled publication, isolated from private browser cards.
create extension if not exists pgcrypto;

create table if not exists public.gallery_publications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 100),
  description text not null default '' check (char_length(description) <= 500),
  category text not null default 'business'
    check (category in ('business', 'creative', 'personal')),
  theme text not null default 'dark'
    check (theme in ('dark', 'light', 'violet', 'minimal', 'midnight')),
  card_data jsonb not null check (jsonb_typeof(card_data) = 'object'),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'hidden')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gallery_publication_published_at_consistency
    check ((status = 'published' and published_at is not null) or status <> 'published')
);

create index if not exists gallery_publications_public_feed_idx
  on public.gallery_publications (published_at desc, id)
  where status = 'published';
create index if not exists gallery_publications_owner_updated_idx
  on public.gallery_publications (owner_id, updated_at desc);

create or replace function public.set_gallery_publication_timestamps()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    new.published_at := now();
  elsif new.status <> 'published' then
    new.published_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists gallery_publications_timestamps on public.gallery_publications;
create trigger gallery_publications_timestamps
before insert or update on public.gallery_publications
for each row execute function public.set_gallery_publication_timestamps();

alter table public.gallery_publications enable row level security;
revoke all on table public.gallery_publications from public, anon, authenticated;

-- Public clients can only read the curated card payload and metadata, never owner_id.
grant select (id, title, description, category, theme, card_data, status, published_at, created_at, updated_at)
  on public.gallery_publications to anon, authenticated;
grant insert (owner_id, title, description, category, theme, card_data, status)
  on public.gallery_publications to authenticated;
grant update (title, description, category, theme, card_data, status)
  on public.gallery_publications to authenticated;
grant delete on public.gallery_publications to authenticated;

drop policy if exists gallery_publications_read_public_or_owner on public.gallery_publications;
create policy gallery_publications_read_public_or_owner
  on public.gallery_publications for select to anon, authenticated
  using (status = 'published' or owner_id = (select auth.uid()));

drop policy if exists gallery_publications_insert_owner on public.gallery_publications;
create policy gallery_publications_insert_owner
  on public.gallery_publications for insert to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists gallery_publications_update_owner on public.gallery_publications;
create policy gallery_publications_update_owner
  on public.gallery_publications for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists gallery_publications_delete_owner on public.gallery_publications;
create policy gallery_publications_delete_owner
  on public.gallery_publications for delete to authenticated
  using (owner_id = (select auth.uid()));

revoke all on function public.set_gallery_publication_timestamps() from public, anon, authenticated;
