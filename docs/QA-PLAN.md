# QA and Release Plan

## Automated checks

- TypeScript typecheck.
- Unit tests for validation, persistence failure, export escaping and QR payload construction.
- Production build.
- Firebase Functions unit tests and TypeScript build.
- Dependency update automation through Dependabot.

## P0 acceptance

- [x] QR generation does not send payloads to an external API.
- [x] Invalid email/URL input produces actionable errors.
- [x] Storage unavailable/quota exceeded does not crash the app or claim a save succeeded.
- [x] No Base64-as-security share link exists.
- [x] No client-side Google Wallet signing secret exists.
- [x] Wallet and access-control buttons accurately indicate unavailable backend functionality.
- [x] Secure sharing backend uses opaque token hashes, approved-field snapshots, expiry, revocation, and rate limiting.
- [ ] Connect the sharing backend to frontend sign-in, share-link, and revocation flows before enabling the feature.
- [ ] Complete Firebase emulator/integration tests and production privacy review.

## P1 manual matrix

- [ ] 320px, 375px, 390px and tablet widths; no horizontal overflow.
- [ ] Keyboard-only editor and visible focus.
- [ ] Screen reader labels for form fields and actions.
- [ ] Create/edit/save/refresh/restore/export workflow.
- [ ] Long names, missing optional fields, Unicode and international phone formats.
- [ ] QR scan matches the selected vCard fields.
- [ ] Gallery search/filter and card selection work on touch devices.
- [ ] Browser back/forward and storage failure behavior.
- [ ] PWA manifest loads and installation/Add to Home Screen is available on supported browsers.
- [ ] After one online load, cached app shell opens offline and local cards remain available.
- [ ] Service worker refreshes on a new deployment without a broken app shell.
- [ ] App remains usable online when service workers are unavailable.

## P2 / P3 gates

- Pricing claims match implemented entitlement enforcement.
- Billing/webhooks are idempotent and subscription state is server-authoritative.
- Tenant isolation and role-based access tests pass.
- Employee offboarding revokes credentials promptly.
- Access-control pilot passes threat modeling and independent review.
