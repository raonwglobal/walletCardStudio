# Secure Public Sharing — Firebase Backend and Frontend

## Scope

The repository now contains the Firebase share-token backend and an optional frontend integration. The share UI remains unavailable until valid Firebase web configuration, Google Authentication, App Check, deployed callable functions, and Firestore rules are configured for the target environment.

## Functions

- `createShare`: authenticated callable; requires Firebase App Check; accepts a profile snapshot, explicit field allowlist, and expiry from 1–90 days (default 7).
- `listMyShares`: authenticated callable; requires App Check; returns only the signed-in owner's share metadata, limited to 50 records.
- `resolveShare`: public callable; accepts the token in the callable request body, applies an IP-based minute rate limit, and returns only the approved snapshot.
- `revokeShare`: authenticated callable; requires App Check and verifies ownership using the non-bearer share identifier (the SHA-256 hash document ID).

Tokens contain 256 bits of random data. The raw token is returned once and is never stored. Firestore document IDs are SHA-256 token hashes. Expired and revoked links return the same unavailable response. The saved profile is a snapshot; edits to a local card do not automatically update an existing share.

## Frontend configuration

Copy `.env.example` to `.env.local` and set values from the Firebase web app and App Check configuration:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID` (if provided by Firebase)
- `VITE_FIREBASE_APPCHECK_SITE_KEY` (required for create/list/revoke operations)
- `VITE_FIREBASE_FUNCTIONS_REGION` (defaults to `us-central1`)

The UI uses Google sign-in. Enable the Google provider and authorize the deployed app's domain in Firebase Authentication. Register the same domain in Firebase App Check. Do not use placeholder values in a deployed build.

Share links put the opaque token in the URL fragment (`#share=...`) rather than the query string. Fragments are not sent to the hosting server in HTTP requests. The frontend submits the token to `resolveShare` in the callable request body. Never log the raw link or token.

## Data safety

- Only selected fields from `PUBLIC_FIELDS` can be published; name is required.
- Server-side validation checks field lengths, email shape, and HTTP(S) website URLs.
- Firestore rules deny direct client reads and writes. Trusted Cloud Functions use the Admin SDK.
- Rate-limit records contain hashed IP/minute keys, not raw IP addresses. Configure Firestore TTL for `shareRateLimits.expiresAt`.
- Public profile snapshots are personal data. Define retention and deletion procedures before production use.
- The share panel starts with name, role, and company selected; users must opt in to share contact details.

## Setup and deployment

1. Create/select a Firebase project and enable Authentication, App Check, Cloud Functions, and Firestore.
2. Configure the Google Authentication provider and approved domains.
3. Copy `.env.example` to `.env.local`, then populate the Firebase web configuration and App Check site key.
4. Install the Firebase CLI and authenticate with the intended deployment account.
5. From the repository root, run `cd functions && bun install && bun test && bun run build`.
6. Deploy with `firebase deploy --only functions,firestore:rules` after reviewing project selection and billing.
7. Configure Firestore TTL for `shareRateLimits.expiresAt` and monitor callable errors and rate-limit behavior.

Never commit service-account keys or production credentials. Use Firebase's managed runtime identity and project-scoped deployment permissions.

## Release gates still outstanding

- Firebase emulator/integration tests for ownership, expiry, revocation, rate limiting, and data minimization.
- Production deployment, App Check verification, abuse monitoring, and privacy/retention review.
- Manual confirmation that no token or profile data is written to application logs or analytics.
- Configure the real Firebase project and validate sign-in/share/revoke/resolution end to end before announcing the feature.
