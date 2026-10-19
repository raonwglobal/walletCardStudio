# Architecture

## Initial frontend

- `src/App.tsx`: editor, live card preview, gallery and user-facing capability boundaries.
- `src/lib/cards.ts`: card model, validation, local persistence and export helpers.
- `src/lib/qr.ts`: local QR payload generation using the `qrcode` package.
- `src/styles.css`: responsive styling and accessible focus states.
- Browser storage is a prototype persistence layer, not a cloud backup or security boundary.

## PWA and offline behavior

- `public/manifest.webmanifest`: install metadata and app icons.
- `public/sw.js`: cached app shell, network-first navigation fallback and cache-first same-origin assets.
- `src/main.tsx`: registers the service worker in production builds only.
- Offline behavior covers the app shell and previously cached static assets; card data remains in localStorage and is not synced, encrypted, or backed up by the service worker.
- Firebase callable requests and other cross-origin requests are not cached.

## Domain model

- `CardDesign`: layout, colors, typography and template configuration; no identity fields.
- `PublicCardProfile`: explicitly approved fields safe for public display.
- `CardRecord`: owner, profile reference, design, timestamps and lifecycle status.
- `ShareRecord`: server-side opaque token hash, approved field snapshot, owner, expiration and revocation state.

Keep design configuration separate from personal profile data so that templates can be reused without copying PII.

## Firebase backend

- `functions/src/index.ts`: callable create, resolve and revoke share endpoints.
- `functions/src/sharing.ts`: 256-bit opaque token generation, SHA-256 hashing, field allowlist and input validation.
- `publicShares/{sha256(token)}`: stores only the token hash as document ID, owner UID, approved profile snapshot, selected fields, expiry, revocation state and schema version.
- `shareRateLimits/{hash(ip + minute)}`: short-lived counters used to throttle public resolution.
- Firestore rules deny direct client access; trusted Cloud Functions use the Admin SDK.
- Authenticated creation/revocation requires Firebase Authentication and App Check. Public resolution receives the token in the callable body.

The Firebase service is backend-only until the UI authentication, field selection, share page, revoke flow, emulator tests and deployment are complete. Do not label public sharing as live before those gates pass.

## Future backend boundaries

1. Authentication and authorization.
2. Card/profile API with ownership checks and tenant isolation.
3. Share-token service with scoped access, expiration, revocation and rate limiting.
4. Google Wallet issuer service; signing keys remain server-side.
5. Organization administration, audit events and billing.
6. Optional access validation service, isolated from public profile endpoints.

## Data flow constraints

- QR is generated on-device. A vCard QR embeds its selected contact fields, so warn users before exporting.
- Do not encode full personal profiles in URL query strings or claim Base64 is encryption.
- Never put secrets, signing keys, or privileged API credentials in Vite environment variables prefixed with `VITE_`.
- Do not treat a visual badge or QR scan as authorization. Access decisions must be server-side.
