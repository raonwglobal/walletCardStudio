# Supabase self-hosting and migration guide

## Goal

Keep the Wallet Card Studio frontend and secure public-share backend portable and open-source-friendly. This change replaces Firebase usage in the frontend sharing workflow; it does not migrate local browser card data into the cloud.

## Deployment sequence

1. Provision a Linux host or VM with Docker Engine and Compose, persistent SSD storage, monitoring and tested backups.
2. Follow the official [Supabase Docker guide](https://supabase.com/docs/guides/self-hosting/docker). Pin the upstream Supabase repository to a reviewed release/commit for repeatable deployments.
3. Place Caddy or Nginx in front of the API with TLS. Expose only required HTTPS endpoints; do not expose PostgreSQL or the Studio dashboard publicly without additional access controls.
4. Rotate all default keys/passwords and store secrets outside Git. Restrict service-role credentials to Edge Function runtime.
5. Configure Auth Google OAuth and exact redirect URLs.
6. Apply the project migration and deploy `share-links` as described in [README.md](../README.md).
7. Run end-to-end tests for create/list/resolve/revoke, expiry, invalid tokens, ownership isolation and rate limiting.
8. Take a backup and perform a restore drill before production cutover.

## Operational requirements

- Patch the host, Docker images and Supabase components on a regular schedule.
- Back up PostgreSQL and any enabled object storage; encrypt backups and keep a copy outside the host.
- Monitor disk space, API/Edge Function errors, database health and backup freshness.
- Configure an exact `APP_ORIGIN`; additionally rate-limit `/functions/v1/share-links` at the reverse proxy.
- Keep a rollback window before deleting Firebase data or credentials. This repository retains Firebase deployment artifacts temporarily, but the frontend's share path now targets Supabase.

## Cutover caveat

Existing Firebase shares are not automatically imported. If active links must remain valid, run a separate authenticated export/import plan that preserves expiry/revocation semantics without exposing raw tokens. Otherwise notify link owners that links created before cutover will need to be recreated.
