# Security

## Data boundaries

- Browser storage is local convenience storage, not encrypted cloud backup.
- vCard QR codes expose the included contact fields to anyone who scans them.
- Public share tokens are high-entropy random values. Store only their SHA-256 hashes.
- Share resolution returns only the selected field snapshot and rejects expired or revoked tokens.
- Owner share operations must validate Supabase Auth JWTs and scope queries by the authenticated user ID.
- RLS is enabled on share and rate-limit tables without direct client policies. The service-role key is server-only.
- Never put service-role keys, database credentials or signing keys in Vite `VITE_*` environment variables.

## Self-hosted operations

Use TLS, rotate default secrets, restrict Studio/dashboard access, keep PostgreSQL private, patch the host and images, monitor errors and disk space, and regularly test encrypted off-host backups. Add reverse-proxy request limits to the Edge Function endpoint.

## Out of scope

A visible badge or QR code is not proof of authorization. Physical access control, employee lifecycle, tenant isolation, audit trails and Google Wallet signing require separate trusted backend work and security review.
