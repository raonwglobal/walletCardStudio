# Secure Public Sharing — Firebase Backend

## Scope

This change adds the server-side share-token service. It does **not** yet connect the current local-only React UI to Firebase, add sign-in screens, or make public sharing available in the product UI. Do not represent sharing as live until frontend integration and deployment verification are complete.

## Functions

- `createShare`: authenticated callable; requires Firebase App Check; accepts a profile snapshot, explicit field allowlist, and expiry from 1–90 days (default 7).
- `resolveShare`: public callable; accepts the token in the callable request body, applies an IP-based minute rate limit, and returns only the approved snapshot.
- `revokeShare`: authenticated callable; requires App Check and verifies that the caller owns the share record.

Tokens contain 256 bits of random data. The raw token is returned once and is never stored. Firestore document IDs are SHA-256 token hashes. Expired and revoked links return the same unavailable response. The saved profile is a snapshot; edits to a local card do not automatically update an existing share.

## Data safety

- Only the selected fields in `PUBLIC_FIELDS` can be published; the name field is required.
- Server-side validation checks field lengths, email shape, and HTTP(S) website URLs.
- Firestore rules deny direct client reads and writes. The trusted Functions Admin SDK accesses records.
- The rate-limit collection stores hashed IP/minute keys, not raw IP addresses. Configure Firestore TTL for `shareRateLimits.expiresAt` to clean up old counters.
- Public profile snapshots are personal data. Define retention and deletion procedures before production use.

## Setup and deployment

1. Create/select a Firebase project and enable Authentication, App Check, Cloud Functions, and Firestore.
2. Configure at least one supported Firebase Authentication provider. The current app does not yet provide sign-in; authenticated create/revoke calls cannot be used from the UI until that work is completed.
3. Register the deployed web app with Firebase App Check and initialize App Check in the frontend before calling `createShare` or `revokeShare`.
4. Install the Firebase CLI and authenticate with the intended deployment account.
5. From the repository root, run `npm --prefix functions install`, `npm --prefix functions test`, and `npm --prefix functions run build`.
6. Deploy with `firebase deploy --only functions,firestore:rules` after reviewing project selection and billing.
7. Configure Firestore TTL for the `shareRateLimits` collection's `expiresAt` field and monitor callable errors and rate-limit behavior.

Never commit service-account keys or production credentials. Use Firebase's managed runtime identity and project-scoped deployment permissions.

## Release gates still outstanding

- Frontend sign-in, field-selection UI, share URL generation, public share page, and revoke UI.
- Firebase emulator/integration tests for ownership, expiry, revocation, rate limiting, and data minimization.
- Production deployment, App Check verification, abuse monitoring, and privacy/retention review.
- Manual confirmation that no token or profile data is written to application logs or analytics.
