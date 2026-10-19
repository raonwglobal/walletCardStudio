import { createHash, randomBytes } from "node:crypto";

export const PUBLIC_FIELDS = [
  "name",
  "role",
  "company",
  "email",
  "phone",
  "website",
  "location",
  "bio",
] as const;

export type PublicField = (typeof PUBLIC_FIELDS)[number];
export type PublicProfile = Partial<Record<PublicField, string>> & { name: string };

const FIELD_LIMITS: Record<PublicField, number> = {
  name: 120,
  role: 120,
  company: 120,
  email: 254,
  phone: 64,
  website: 2048,
  location: 160,
  bio: 500,
};

export function createOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function isValidToken(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}

export function normalizeExpiryDays(value: unknown): number {
  if (value === undefined || value === null) return 7;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 90) {
    throw new Error("expiresInDays must be an integer between 1 and 90.");
  }
  return value;
}

export function normalizePublicProfile(input: unknown, requestedFields: unknown): {
  fields: PublicField[];
  profile: PublicProfile;
} {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("profile must be an object.");
  }
  if (!Array.isArray(requestedFields) || requestedFields.length === 0) {
    throw new Error("Select at least one public field.");
  }

  const fields: PublicField[] = [];
  for (const field of requestedFields) {
    if (typeof field !== "string" || !PUBLIC_FIELDS.includes(field as PublicField)) {
      throw new Error("One or more selected public fields are not allowed.");
    }
    if (!fields.includes(field as PublicField)) fields.push(field as PublicField);
  }
  if (!fields.includes("name")) throw new Error("The name field must be included.");

  const source = input as Record<string, unknown>;
  const profile: Record<string, string> = {};
  for (const field of fields) {
    const raw = source[field];
    if (typeof raw !== "string") {
      if (field === "name") throw new Error("A name is required.");
      continue;
    }
    const value = raw.trim();
    if (!value) {
      if (field === "name") throw new Error("A name is required.");
      continue;
    }
    if (value.length > FIELD_LIMITS[field]) {
      throw new Error(`${field} exceeds the maximum allowed length.`);
    }
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error("email is invalid.");
    }
    if (field === "website") {
      let url: URL;
      try {
        url = new URL(value);
      } catch {
        throw new Error("website must be a valid http or https URL.");
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("website must use http or https.");
      }
    }
    profile[field] = value;
  }

  return { fields, profile: profile as PublicProfile };
}
