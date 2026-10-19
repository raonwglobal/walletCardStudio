# Architecture

## Initial frontend

- `src/App.tsx`: editor, live card preview, gallery and user-facing capability boundaries.
- `src/lib/cards.ts`: card model, validation, local persistence and export helpers.
- `src/lib/qr.ts`: local QR payload generation using the `qrcode` package.
- `src/styles.css`: responsive styling and accessible focus states.
- Browser storage is a prototype persistence layer, not a cloud backup or security boundary.

## Domain model direction

- `CardDesign`: layout, colors, typography and template configuration; no identity fields.
- `PublicCardProfile`: explicitly approved fields safe for public display.
- `CardRecord`: owner, profile reference, design, timestamps and lifecycle status.
- `ShareRecord`: server-side opaque token hash, card reference, scope, expiration and revocation status.

Keep design configuration separate from personal profile data so that templates can be reused without copying PII.

## Future backend boundaries

1. Authentication and authorization.
2. Card/profile API with ownership checks and tenant isolation.
3. Share-token service that generates high-entropy opaque tokens; store token hashes, enforce scope/expiry/revocation, and rate-limit resolution.
4. Google Wallet issuer service; signing keys remain server-side.
5. Organization administration, audit events and billing.
6. Optional access validation service, isolated from public profile endpoints.

## Data flow constraints

- QR is generated on-device. A vCard QR embeds its selected contact fields, so warn users before exporting.
- Do not encode full personal profiles in URL query strings or claim Base64 is encryption.
- Never put secrets, signing keys, or privileged API credentials in Vite environment variables prefixed with `VITE_`.
- Do not treat a visual badge or QR scan as authorization. Access decisions must be server-side.
