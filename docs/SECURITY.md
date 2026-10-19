# Security and Privacy Requirements

## P0 requirements

- [x] QR payloads are generated locally; no third-party QR endpoint receives card data.
- [x] Validate required fields and basic email/URL formats before saving/exporting.
- [x] Handle unavailable or malformed browser storage without crashing.
- [x] Do not implement Base64 profile links as if they were secure sharing.
- [x] Clearly mark Wallet and access-control features as not yet connected.
- [ ] Add automated security tests and dependency scanning in CI.
- [ ] Decide and document data retention, export and deletion behavior before public launch.

## Personal data

- Collect only fields needed for the selected card.
- vCard QR and downloaded JSON contain personal information. Explain this before export.
- Browser local storage may be exposed by XSS or shared-device access. Do not store authentication tokens or highly sensitive data there.
- Future photo uploads must enforce size/type limits, compress images, strip EXIF where feasible and provide deletion controls.
- Do not send contact data to external image/QR services without explicit disclosure and a justified need.

## Sharing

- Base64 is an encoding, not encryption or access control.
- Future public share links must use server-generated high-entropy opaque tokens, scoped access, expiration, revocation and rate limiting.
- Avoid personal data in URLs, analytics events and application logs.
- Prevent public share endpoints from exposing fields that the owner did not approve.

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
