# Supabase database security tests

## Prerequisites

- Supabase CLI installed
- Docker Engine and Compose running
- Project migrations applied to the local Supabase database

## Run

From the repository root:

```sh
supabase start
supabase db reset
supabase test db
```

The pgTAP suite in `supabase/tests/database/secure_public_shares.test.sql` checks that both tables exist, row-level security is enabled, no direct table policies are present, client roles cannot read share records directly, and only the server-side service role can execute the rate-limit function.

These database tests complement the Deno unit tests in `supabase/functions/_shared/share-validation.test.ts`. They do not replace deployed end-to-end tests for OAuth, share lifecycle, rate limiting through the real reverse proxy, or backup restoration.

If the local Supabase CLI version does not provision the `pgtap` extension automatically, ensure the extension is available in the local database before running the suite.
