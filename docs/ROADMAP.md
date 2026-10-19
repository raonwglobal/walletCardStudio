# Wallet Card Studio Roadmap

## Delivery rules

- Work in small, reviewable changes on feature branches; merge only after CI and review.
- Preserve the source brief's product scope, but distinguish planned features from implemented ones.
- Security and data integrity are release gates, not optional polish.
- Do not add access-control claims to marketing until backend enforcement has passed security testing.

## P0 — Foundation and security

- [x] Initialize repository and document delivery phases.
- [x] Establish React + TypeScript + Vite project structure.
- [x] Generate QR codes locally; do not send contact payloads to a QR API.
- [x] Add input validation, local storage error handling and automated checks.
- [ ] Add server-backed share records with opaque random tokens, expiration, scopes and revocation.
- [ ] Complete privacy review, dependency review and security test cases.
- [ ] Implement server-side Google Wallet pass issuance and validate issuer/class/object configuration.

**Exit criteria:** typecheck, tests and production build pass; no client-side signing secrets; no base64-as-security share URLs; limitations are visible in the UI.

## P1 — Mobile-first personal card MVP

- [x] Responsive card editor and live preview.
- [x] Personal card gallery with search and category filters.
- [x] Local save/restore and JSON export.
- [x] vCard QR generation on-device.
- [ ] Add installable PWA manifest/service worker and offline behavior.
- [ ] Add image compression, EXIF stripping and explicit photo retention controls.
- [ ] Test small-screen, keyboard, screen-reader and browser compatibility.
- [ ] Validate end-to-end completion with representative users.

**Exit criteria:** a user can create, edit, save, restore and export a card on a phone without horizontal overflow or losing work silently.

## P2 — Growth and monetization

- [ ] Keep basic card creation and QR sharing in Free to reduce adoption friction.
- [ ] Prototype Pro features: multiple cards, premium templates, branded QR, analytics and cloud sync.
- [ ] Prototype Team: shared templates, member management, bulk onboarding and organization branding.
- [ ] Instrument funnel events with consent and data minimization.
- [ ] Test willingness to pay before locking prices; track conversion, retention, churn and support costs.

**Exit criteria:** paid pilots or user research validate a price/value hypothesis; variable cost and gross margin are measured.

## P3 — B2B / enterprise

- [ ] Tenant-aware backend and authorization model.
- [ ] Admin console, invitation lifecycle, employee offboarding and badge revocation.
- [ ] Audit events, retention policy, export and support workflows.
- [ ] SSO/SCIM and HR integrations based on customer demand.
- [ ] Enterprise SLA, incident response and data processing documentation.

## Separate security gate — access control

- [ ] Define reader/device threat model and trust boundaries.
- [ ] Server-side authorization on every access decision.
- [ ] Short-lived credentials, replay resistance and revocation.
- [ ] Lost/stolen badge and employee termination flows.
- [ ] Tamper-resistant audit trail and operational monitoring.
- [ ] Independent security review and controlled pilot.

A QR code or wallet pass display alone is not an access-control system.
