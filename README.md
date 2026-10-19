# Wallet Card Studio

Mobile-first digital business card studio and employee badge platform.

## Project status

This repository was initialized from the Wallet Card Studio v5 development brief. The product is being delivered in gated phases; do not treat planned server-backed features as implemented.

- **P0 — Foundation & security:** project structure, validation, local QR generation, safe storage boundaries, automated checks.
- **P1 — Mobile MVP:** responsive card editor, preview, local persistence, gallery and export/share-ready vCard QR.
- **P2 — Monetization:** Free / Pro / Team packaging, usage metrics and pricing validation.
- **P3 — B2B:** tenant-aware team administration, employee lifecycle, audit logs and integrations.
- **Later / gated:** Google Wallet pass issuance, rotating OTP badges and physical access control require a trusted backend and security review.

## Technology

- React + TypeScript + Vite
- Tailwind CSS
- Bun-compatible scripts
- `qrcode` package for client-side QR generation (no third-party QR API receives contact details)
- Vitest + Testing Library

## Local development

```sh
bun install
bun run dev
bun run typecheck
bun run test
bun run build
```

## Security boundaries

- Client-side storage is for a local prototype and is not a secure cloud backup.
- A QR code containing vCard data intentionally exposes that data to anyone who scans it. Preview the payload before downloading.
- Base64 is not encryption. Public share links must use server-generated opaque tokens with expiry and revocation; no base64-encoded profile URLs are implemented.
- Google Wallet issuance must be signed by a trusted backend. Never place service-account credentials or signing keys in frontend code.
- A displayed employee badge is not proof of authorization. Access control requires server-side validation, replay protection, revocation and audit logging.

## Product decisions

See [docs/ROADMAP.md](docs/ROADMAP.md), [docs/SECURITY.md](docs/SECURITY.md), [docs/PRICING.md](docs/PRICING.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/METRICS.md](docs/METRICS.md) and [docs/QA-PLAN.md](docs/QA-PLAN.md).

## Current limitations

This initial frontend does not yet create server-backed public profiles, issue real Google Wallet passes, refresh employee OTPs, or authorize physical access. Those actions remain explicitly unavailable until the corresponding backend is implemented and tested.
