# QA and Release Plan

## Automated checks

- TypeScript typecheck.
- Unit tests for validation, persistence failure, export escaping and QR payload construction.
- Production build.
- Dependency and secret scanning in CI (to be configured).

## P0 acceptance

- [ ] QR generation does not send payloads to an external API.
- [ ] Invalid email/URL input produces actionable errors.
- [ ] Storage unavailable/quota exceeded does not crash the app or claim a save succeeded.
- [ ] No Base64-as-security share link exists.
- [ ] No client-side Google Wallet signing secret exists.
- [ ] Wallet and access-control buttons accurately indicate unavailable backend functionality.

## P1 manual matrix

- [ ] 320px, 375px, 390px and tablet widths; no horizontal overflow.
- [ ] Keyboard-only editor and visible focus.
- [ ] Screen reader labels for form fields and actions.
- [ ] Create/edit/save/refresh/restore/export workflow.
- [ ] Long names, missing optional fields, Unicode and international phone formats.
- [ ] QR scan matches the selected vCard fields.
- [ ] Gallery search/filter and card selection work on touch devices.
- [ ] Browser back/forward and storage failure behavior.

## P2 / P3 gates

- Pricing claims match implemented entitlement enforcement.
- Billing/webhooks are idempotent and subscription state is server-authoritative.
- Tenant isolation and role-based access tests pass.
- Employee offboarding revokes credentials promptly.
- Access-control pilot passes threat modeling and independent review.
