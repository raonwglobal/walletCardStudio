# Wallet Card Studio

Mobile-first digital business card studio and employee badge platform. The app keeps card editing, local persistence, QR generation and vCard export in the browser, with an optional server-backed secure sharing workflow.

## Technology

- React + TypeScript + Vite
- Tailwind CSS
- Supabase Auth, PostgreSQL and Edge Functions for secure public-share links
- `qrcode` for local QR generation (contact details are not sent to a third-party QR API)
- Vitest + Testing Library; Bun-compatible scripts

## Local development

1. Copy `.env.example` to `.env.local`.
2. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Run:

```sh
bun install
bun run dev
bun run typecheck
bun run test
bun run build
```

## Self-hosted Supabase

Use the official Supabase Docker Compose distribution and deployment guide:

- https://supabase.com/docs/guides/self-hosting/docker
- https://github.com/supabase/supabase/tree/master/docker

The upstream stack changes independently of this project. Pin a reviewed upstream release/commit, rotate all default secrets, terminate TLS at a maintained reverse proxy, restrict Studio/dashboard access, keep PostgreSQL private, persist data, and test backup restoration.

### Apply the project backend

1. Install the Supabase CLI and link the target project.
2. Apply the migration with `supabase db push` or execute `supabase/migrations/20261020000100_secure_public_shares.sql`.
3. Set the production app origin: `supabase secrets set APP_ORIGIN=https://your-app.example`.
4. Deploy the function: `supabase functions deploy share-links --no-verify-jwt`.
5. Enable Google OAuth in Supabase Auth and configure exact site and redirect allow-list URLs.
6. Verify create/list/resolve/revoke, expiry, ownership isolation, invalid tokens, rate limiting and backup restoration before production use.

The function disables gateway JWT verification so anonymous token resolution can use the same endpoint. It manually validates Supabase Auth JWTs for owner operations. The service-role key remains server-side.

## Security boundaries

- Only the public anon key belongs in frontend configuration. Never expose `SUPABASE_SERVICE_ROLE_KEY`, database passwords or JWT signing secrets in `VITE_*` variables.
- Share tokens contain 256 bits of randomness; only SHA-256 hashes are stored. Raw tokens are returned only once.
- RLS is enabled on share tables without direct anon/authenticated table policies. Owner actions are scoped to the authenticated user.
- Public links show only the explicitly selected profile snapshot and stop working after expiry or revocation.
- Configure `APP_ORIGIN` to the exact app origin and enforce additional request limits at the trusted reverse proxy.
- Browser storage is not encrypted cloud backup. Card records remain local-first; this migration does not add cloud synchronization.
- A vCard QR exposes its included fields to anyone who scans it. A displayed employee badge or QR is not proof of authorization.

## Cutover limitations

Existing Firebase-hosted share records are not automatically imported. Recreate active links after cutover unless a separate controlled export/import is completed. This backend does not yet implement cloud card sync, team tenancy, employee lifecycle, audit trails, Google Wallet pass issuance or physical access authorization.

See [Architecture](docs/ARCHITECTURE.md), [Security](docs/SECURITY.md), [Secure sharing implementation](docs/SECURE-SHARING-IMPLEMENTATION.md), [Self-hosting guide](docs/SUPABASE-SELF-HOSTING.md), [Roadmap](docs/ROADMAP.md), [QA plan](docs/QA-PLAN.md), [PWA notes](docs/PWA.md), [Pricing](docs/PRICING.md) and [Metrics](docs/METRICS.md).
