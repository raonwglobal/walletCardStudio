# Public gallery foundation

This migration introduces the database foundation for a public design gallery. It does not change the existing browser-local card storage and does not automatically publish any existing cards.

## Privacy and publication rules

- A publication is created only through an authenticated session.
- New records default to `draft`; the owner must explicitly change status to `published`.
- Only published records are visible to anonymous users. Owners can see and manage their own drafts and hidden records.
- Public read grants intentionally exclude `owner_id`.
- Row-level security restricts insert, update, and delete operations to the authenticated owner.
- Moving a record out of `published` removes it from the public feed; the trigger clears `published_at`.
- `card_data` is a user-approved, public-safe payload, not a dump of the entire private card. The UI/API must present a preview and explicit consent, and only include fields the user chose to publish.

## Scope of this phase

This is the schema and access-control foundation only. The public gallery UI, authenticated publication workflow, explicit field selection, search, favorites, reports, and moderation are follow-up work. Do not deploy the migration to the hosted Supabase project until the CI migration and pgTAP security tests pass and the migration is reviewed.
