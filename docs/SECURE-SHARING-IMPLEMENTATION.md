# Secure sharing implementation

## Backend

The secure sharing backend uses Supabase Auth, PostgreSQL and the `share-links` Edge Function.

- Create: authenticated owner, allowlisted fields, validated profile snapshot, 1–90 day expiry and 256-bit random token.
- Storage: SHA-256 token hash only; raw token is returned once at creation.
- List: results scoped to the authenticated owner.
- Resolve: token format, expiry and revocation are checked; only the stored allowlisted profile snapshot is returned.
- Revoke: the authenticated owner ID is checked before updating the record.
- Database: RLS is enabled and no direct anon/authenticated table policies are granted. The service-role key is confined to Edge Function runtime.
- Abuse controls: atomic per-minute database counter plus reverse-proxy rate limiting recommended for self-hosted deployment.

## Automated validation

The pure share-validation rules live in `supabase/functions/_shared/share-validation.ts` and have a Deno unit-test suite. CI runs:

```sh
deno check supabase/functions/share-links/index.ts
deno test supabase/functions/_shared/share-validation.test.ts
```

Coverage includes token format, selected-field allowlisting, required name, duplicate fields, malformed profile input, email/URL validation, field-length limits and omission of blank optional values.

## Deploy and verify

See [README.md](../README.md) and [SUPABASE-SELF-HOSTING.md](./SUPABASE-SELF-HOSTING.md). Before production, also run deployment-level tests for valid/invalid tokens, expiry, revocation, owner isolation, rate limiting and backup restoration.

## Scope

Card records remain in local browser storage. This service stores only a snapshot explicitly selected for public sharing; it does not implement cloud card synchronization or organization/team tenancy.
