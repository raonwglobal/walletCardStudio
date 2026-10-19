import { describe, expect, it } from "vitest";
import {
  createOpaqueToken,
  hashToken,
  isValidToken,
  normalizeExpiryDays,
  normalizePublicProfile,
} from "./sharing.js";

describe("opaque share tokens", () => {
  it("generates URL-safe high-entropy tokens and stores a deterministic hash", () => {
    const token = createOpaqueToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(isValidToken(token)).toBe(true);
    expect(hashToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toBe(token);
  });

  it("rejects malformed tokens", () => {
    expect(isValidToken("short")).toBe(false);
    expect(isValidToken("x".repeat(43) + "!")).toBe(false);
    expect(isValidToken(null)).toBe(false);
  });
});

describe("share expiry", () => {
  it("defaults to seven days and accepts up to ninety days", () => {
    expect(normalizeExpiryDays(undefined)).toBe(7);
    expect(normalizeExpiryDays(90)).toBe(90);
  });

  it("rejects invalid expiry values", () => {
    expect(() => normalizeExpiryDays(0)).toThrow();
    expect(() => normalizeExpiryDays(91)).toThrow();
    expect(() => normalizeExpiryDays(1.5)).toThrow();
  });
});

describe("public profile allowlist", () => {
  it("returns only explicitly selected public fields", () => {
    const result = normalizePublicProfile({
      name: " Alex Morgan ",
      email: "alex@example.com",
      phone: "+1 415 555 0134",
      ownerUid: "must-not-leak",
      id: "private-id",
    }, ["name", "email"]);

    expect(result.fields).toEqual(["name", "email"]);
    expect(result.profile).toEqual({ name: "Alex Morgan", email: "alex@example.com" });
  });

  it("requires the name field and rejects unknown fields", () => {
    expect(() => normalizePublicProfile({ name: "Alex" }, ["email"])).toThrow(/name field/);
    expect(() => normalizePublicProfile({ name: "Alex" }, ["name", "ownerUid"])).toThrow(/not allowed/);
  });

  it("validates URLs, emails, and field lengths", () => {
    expect(() => normalizePublicProfile({ name: "Alex", website: "javascript:alert(1)" }, ["name", "website"])).toThrow(/http/);
    expect(() => normalizePublicProfile({ name: "Alex", email: "bad" }, ["name", "email"])).toThrow(/email is invalid/);
    expect(() => normalizePublicProfile({ name: "A".repeat(121) }, ["name"])).toThrow(/maximum/);
  });
});
