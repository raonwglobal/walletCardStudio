# Supabase self-hosted backend

Wallet Card Studio keeps card editing, local persistence, QR generation and vCard export in the browser. The secure share service is moving from Firebase to Supabase-compatible open-source components.

## Local frontend

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your local Supabase API URL and public anon key.
3. Run `bun install`, `bun run dev`, `bun run typecheck`, `bun run test`, and `bun run build`.

Only the public anon key belongs in the frontend. **Never** expose `SUPABASE_SERVICE_ROLE_KEY`, database passwords, or JWT signing secrets in any `VITE_*` variable.

## Self-host Supabase

The official Supabase Docker Compose stack is maintained upstream and evolves independently of this app. Start from the official instructions rather than copying a stale third-party compose file:

- https://supabase.com/docs/guides/self-hosting/docker
- https://github.com/supabase/supabase/tree/master/docker

Use the upstream stack's `.env.example` as the starting point, rotate every default secret, configure TLS at a reverse proxy, restrict dashboard/studio access, and keep Postgres off the public internet. Persist Postgres data and test restoration before production use.

## Deploy this project's schema and function

1. Install the Supabase CLI and log in/link the target project.
2. Apply the migration: `supabase db push` (or run `supabase/migrations/20261020000100_secure_public_shares.sql` through the SQL editor).
3. Set the function secrets: `supabase secrets set APP_ORIGIN=https://your-app.example` (Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions).
4. Deploy: `supabase functions deploy share-links --no-verify-jwt`. The function intentionally disables gateway JWT verification so anonymous token resolution can share the same endpoint; owner operations manually validate the bearer JWT with Supabase Auth. Keep the service-role key only in the Edge Function environment.
5. In Supabase Auth, enable Google OAuth and set exact site URL / redirect allow-list entries for the deployed app and local development.

## Security model

- Public-share tokens are generated with 256 bits of randomness; only their SHA-256 hashes are stored.
- Public resolution returns only the allowlisted profile snapshot and rejects expired/revoked links.
- Owner actions validate the JWT with Supabase Auth and scope list/revoke operations to the authenticated user ID.
- RLS is enabled and there are deliberately no client table policies; the service role is only used server-side.
- A database-backed per-minute request counter limits token resolution. Configure `APP_ORIGIN` to the exact production origin and enforce additional reverse-proxy rate limits in front of self-hosted deployments.
- The app continues to save card drafts locally. This migration does not silently turn local cards into cloud-synced records.

## Firebase migration status

Firebase is no longer used by the frontend share UI. The old Firebase Functions and configuration files are retained temporarily during the cutover so they can be removed after deployment and data-retention requirements have been checked. Do not deploy both share backends as competing sources of truth.
