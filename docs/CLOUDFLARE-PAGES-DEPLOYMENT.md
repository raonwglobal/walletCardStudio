# Cloudflare Pages deployment

This repository is a React + TypeScript + Vite static frontend with Supabase Auth and an Edge Function backend. Cloudflare Pages serves the built frontend; Supabase remains the backend. The GitHub repository is the source of truth. Do not edit production code only in the Cloudflare dashboard.

## Pages project settings

Create a Pages project in the Cloudflare dashboard and connect the GitHub repository `raonwglobal/walletCardStudio`.

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Production branch | `main` |
| Build command | `bun run build` |
| Build output directory | `dist` |
| Root directory | repository root (leave blank/default) |
| Node/Bun runtime | Use Bun; the repository CI uses Bun |
| Preview deployments | Enabled for pull requests; preview URLs are not production |

The build command runs `tsc -b && vite build`, as defined in `package.json`. Vite writes the static site to `dist/`. Pages provides SPA fallback when the output contains `index.html` and no top-level `404.html`; do not add a top-level `404.html` unless the routing strategy changes.

## Build environment variables

In Pages > Settings > Environment variables, set these for **Production** and **Preview** as appropriate:

- `VITE_SUPABASE_URL=https://jsirricvlgrvnvglcppi.supabase.co`
- `VITE_SUPABASE_ANON_KEY=<the project's public anon/publishable key>`

Use the actual public key from Supabase Project Settings > API. Do not copy service-role keys, database passwords, JWT signing secrets, or other server-only secrets into any `VITE_*` variable. Vite embeds `VITE_*` values in browser assets, so treat them as public.

Use a separate Supabase project for Preview if practical. If previews share production Supabase, explicitly allow the intended preview origins and accept that preview builds will connect to production data. Avoid broad wildcard redirect URLs.

## Supabase production cutover

After the final production hostname is known:

1. In Supabase Auth > URL Configuration, set **Site URL** to the production origin (for example, `https://wallet-card-studio.pages.dev` or the chosen custom domain).
2. Add the exact Google OAuth callback URL shown by Supabase to the Google Cloud OAuth client. Also add the production origin and only the required preview URLs to Supabase's redirect allow-list.
3. Set the Edge Function's allowed app origin to the production origin:
   `supabase secrets set APP_ORIGIN=https://YOUR-PRODUCTION-HOSTNAME`
4. Deploy the function from a trusted local/CI environment:
   `supabase functions deploy share-links --no-verify-jwt`
5. Confirm the database migrations are applied to the intended Supabase project before testing shares.

Never put the Supabase service-role key in Cloudflare Pages frontend variables. The `share-links` function uses server-side secrets and validates owner actions itself.

## Required release gate

1. Create a feature branch and open a pull request against `main`.
2. Require the existing GitHub Actions `CI / verify` and `CI / database-security` jobs to pass.
3. Require at least one approving review, and dismiss stale approvals / require approval of the latest push if supported by the repository's rules.
4. Do not merge while checks are pending or failing.
5. Merge the approved PR to `main`; the Pages Git integration then builds and publishes the production deployment.
6. Confirm the Pages deployment's commit SHA matches the merged GitHub commit before announcing release.

Cloudflare Pages Git integration can create a non-production preview deployment for a PR before CI/review is complete. Keep preview URLs separate from production and do not treat preview publication as approval. Production should be tied only to the protected `main` branch.

## Verification checklist

- [ ] Pages project is connected to the correct private GitHub repository.
- [ ] Production branch is `main`, build command is `bun run build`, output is `dist`.
- [ ] Production and Preview environment variables are set correctly.
- [ ] The deployed commit SHA matches the reviewed merge commit.
- [ ] App loads over HTTPS and can create/edit a card, generate a QR code, and export vCard.
- [ ] Google sign-in returns to the expected origin.
- [ ] Share create/list/resolve/revoke, expiry, invalid-token behavior, ownership isolation and rate limiting are tested.
- [ ] Browser console and network panel show no failed assets, CORS errors or Supabase configuration errors.
- [ ] Custom domain DNS and TLS are active, if a custom domain is used.

## Cloudflare builder / Workers editor

For this architecture, use the Cloudflare dashboard to configure Pages and its Git integration. Workers & Pages can also provide a browser-based editor for edge code, but editing the app independently there would create a second source of truth. Keep React/Vite app changes in GitHub PRs. Do not add a Worker runtime or `wrangler.toml` just to host this static Vite app; revisit Workers only if a concrete server-side/edge requirement appears.

## Rollback

Use the Pages deployment history to roll back to a known-good production deployment if necessary. Then revert the responsible GitHub change through a new PR so repository history and deployed state converge again.
