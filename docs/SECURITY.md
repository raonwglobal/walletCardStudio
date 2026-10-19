# Security and Privacy Requirements

## P0 requirements

- [x] QR payloads are generated locally; no third-party QR endpoint receives card data.
- [x] Validate required fields and basic email/URL formats before saving/exporting.
- [x] Handle unavailable or malformed browser storage without crashing.
- [x] Do not implement Base64 profile links as if they were secure sharing.
- [x] Clearly mark Wallet and access-control features as not yet connected.
- [x] Add server-side opaque share tokens, token-hash storage, approved-field allowlisting, expiry, revocation and IP-based rate limiting (backend scaffold; production gates remain).
- [ ] Add Firebase emulator/integration security tests and dependency/secret scanning in CI.
- [ ] Connect the frontend authentication/share/revocation flows and complete retention/deletion review before public launch.

## Personal data

- Collect only fields needed for the selected card.
- vCard QR and downloaded JSON contain personal information. Explain this before export.
- Browser local storage may be exposed by XSS or shared-device access. Do not store authentication tokens or highly sensitive data there.
- Future photo uploads must enforce size/type limits, compress images, strip EXIF where feasible and provide deletion controls.
- Do not send contact data to external image/QR services without explicit disclosure and a justified need.

## Sharing

- Base64 is an encoding, not encryption or access control.
- Public links use server-generated high-entropy opaque tokens; Firestore stores only SHA-256 token hashes.
- Create/revoke operations require authentication and App Check; public resolution checks expiry/revocation and applies IP-based rate limits.
- Public responses contain only the explicitly selected fields from a validated profile snapshot.
- Avoid personal data and raw tokens in logs, analytics and Firestore document values.
- Configure Firestore TTL for rate-limit records and define retention/deletion procedures before production use.
- Firebase sharing backend is not yet connected to the frontend; do not claim the product's share UI is live.

## Google Wallet

- Pass objects/JWTs must be issued and signed by a trusted backend.
- Never commit service-account JSON, private keys, tokens or production secrets.
- Verify issuer identity, class/object lifecycle, origin/domain configuration and revocation behavior before enabling the UI.

## Employee badges and access control

- A displayed badge, static QR or client-generated OTP is not sufficient authorization.
- Enforce authorization on the server/reader integration; include expiration, replay resistance, revocation, device identity and audit logging.
- Test employee termination and lost-badge flows.
- Do not market the feature as physical access control until independently reviewed.

## Incident response

Before production: define a security contact, incident triage owner, secret rotation procedure, backup/restore test, retention/deletion policy and customer notification process.
