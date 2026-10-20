# Architecture

## Frontend

- `src/App.tsx`: card editor, preview, gallery and capability boundaries.
- `src/lib/cards.ts`: card validation, local persistence and export.
- `src/lib/qr.ts`: client-side QR payload generation.
- `src/lib/supabase.ts`: public browser client configuration and typed Edge Function invocation boundary.
- Card records remain local-first; this backend migration does not imply cloud sync.

## Supabase-compatible share backend

- `supabase/migrations/20261020000100_secure_public_shares.sql`: share table, indexes, RLS and atomic rate-limit RPC.
- `supabase/functions/share-links/index.ts`: create/list/resolve/revoke actions.
- `public.public_shares`: owner ID, SHA-256 token hash, allowlisted profile snapshot, selected fields, expiry and revocation timestamp.
- `public.share_rate_limits`: hashed caller key and per-minute request counters.
- RLS is enabled with no anon/authenticated table policies. Edge Functions use the service role only server-side and explicitly validate the caller JWT for owner actions.
- Tokens contain 256 bits of randomness; raw tokens are returned only at creation and are never persisted.
- Public resolution receives the token in the POST body, checks expiry/revocation and returns only the approved snapshot.

## Self-hosted deployment

Use the official Supabase Docker Compose distribution, with a maintained TLS reverse proxy, protected Studio/dashboard, private database network, secret rotation, persistent storage and tested backups. See [SUPABASE-SELF-HOSTING.md](./SUPABASE-SELF-HOSTING.md).

## Security boundaries

- Local browser storage is not a secure cloud backup.
- vCard QR intentionally exposes the included contact fields to anyone who scans it.
- Never expose service-role keys or database credentials in Vite environment variables.
- A visible badge or QR is not proof of authorization; physical access needs separate server-side validation, replay protection and audit logging.
