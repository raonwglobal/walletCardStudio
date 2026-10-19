import { initializeApp } from "firebase-admin/app";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import {
  createOpaqueToken,
  hashToken,
  isValidToken,
  normalizeExpiryDays,
  normalizePublicProfile,
} from "./sharing.js";

initializeApp();
const db = getFirestore();

function requireUser(uid: string | undefined): string {
  if (!uid) throw new HttpsError("unauthenticated", "Sign in to manage share links.");
  return uid;
}

function getToken(value: unknown): string {
  if (!isValidToken(value)) throw new HttpsError("invalid-argument", "The share token is invalid.");
  return value;
}

function getShareId(value: unknown): string {
  if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value)) {
    throw new HttpsError("invalid-argument", "The share identifier is invalid.");
  }
  return value;
}

async function enforceResolveRateLimit(ip: string): Promise<void> {
  const minuteBucket = Math.floor(Date.now() / 60_000);
  const rateKey = hashToken(`${ip}:${minuteBucket}`);
  const ref = db.collection("shareRateLimits").doc(rateKey);
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const count = snapshot.exists ? Number(snapshot.get("count") ?? 0) : 0;
    if (count >= 60) {
      throw new HttpsError("resource-exhausted", "Too many share requests. Try again shortly.");
    }
    transaction.set(ref, {
      count: count + 1,
      expiresAt: Timestamp.fromMillis((minuteBucket + 2) * 60_000),
    });
  });
}

export const createShare = onCall({ enforceAppCheck: true }, async request => {
  const ownerUid = requireUser(request.auth?.uid);
  const data = request.data as Record<string, unknown> | undefined;
  if (!data) throw new HttpsError("invalid-argument", "Share details are required.");

  let normalized: ReturnType<typeof normalizePublicProfile>;
  let expiryDays: number;
  try {
    normalized = normalizePublicProfile(data.profile, data.fields);
    expiryDays = normalizeExpiryDays(data.expiresInDays);
  } catch (error) {
    throw new HttpsError("invalid-argument", error instanceof Error ? error.message : "Invalid share details.");
  }

  const token = createOpaqueToken();
  const tokenHash = hashToken(token);
  const expiresAt = Timestamp.fromMillis(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
  await db.collection("publicShares").doc(tokenHash).create({
    ownerUid,
    profile: normalized.profile,
    fields: normalized.fields,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt,
    revokedAt: null,
    schemaVersion: 1,
  });

  // Return the raw token only once. It is never persisted in Firestore or logged.
  return { token, shareId: tokenHash, expiresAt: expiresAt.toDate().toISOString() };
});

export const listMyShares = onCall({ enforceAppCheck: true }, async request => {
  const ownerUid = requireUser(request.auth?.uid);
  const snapshot = await db.collection("publicShares")
    .where("ownerUid", "==", ownerUid)
    .limit(50)
    .get();

  const shares = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      shareId: doc.id,
      fields: Array.isArray(data.fields) ? data.fields : [],
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null,
      expiresAt: data.expiresAt instanceof Timestamp ? data.expiresAt.toDate().toISOString() : null,
      revoked: Boolean(data.revokedAt),
      expired: !(data.expiresAt instanceof Timestamp) || data.expiresAt.toMillis() <= Date.now(),
    };
  });
  shares.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  return { shares };
});

export const resolveShare = onCall(async request => {
  const token = getToken((request.data as Record<string, unknown> | undefined)?.token);
  const ip = request.rawRequest.ip || "unknown";
  await enforceResolveRateLimit(ip);

  const snapshot = await db.collection("publicShares").doc(hashToken(token)).get();
  if (!snapshot.exists) throw new HttpsError("not-found", "This share link is unavailable.");
  const data = snapshot.data();
  if (!data || data.revokedAt || !(data.expiresAt instanceof Timestamp) || data.expiresAt.toMillis() <= Date.now()) {
    throw new HttpsError("not-found", "This share link is unavailable.");
  }

  // Return the stored, field-filtered snapshot only. Never return ownerUid or tokenHash.
  return {
    profile: data.profile,
    fields: data.fields,
    expiresAt: data.expiresAt.toDate().toISOString(),
  };
});

export const revokeShare = onCall({ enforceAppCheck: true }, async request => {
  const ownerUid = requireUser(request.auth?.uid);
  const shareId = getShareId((request.data as Record<string, unknown> | undefined)?.shareId);
  const ref = db.collection("publicShares").doc(shareId);
  const snapshot = await ref.get();
  if (!snapshot.exists || snapshot.get("ownerUid") !== ownerUid) {
    throw new HttpsError("not-found", "This share link is unavailable.");
  }
  if (!snapshot.get("revokedAt")) await ref.update({ revokedAt: FieldValue.serverTimestamp() });
  return { revoked: true };
});
