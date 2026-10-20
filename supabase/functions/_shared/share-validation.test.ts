import { assertEquals, assertThrows } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { isValidShareToken, normalizeShareProfile } from "./share-validation.ts";

Deno.test("accepts a 256-bit base64url token shape", () => {
  assertEquals(isValidShareToken("A".repeat(43)), true);
});

Deno.test("rejects missing, short and non-base64url tokens", () => {
  assertEquals(isValidShareToken(null), false);
  assertEquals(isValidShareToken("short"), false);
  assertEquals(isValidShareToken("A".repeat(42) + "!"), false);
  assertEquals(isValidShareToken("A".repeat(44)), false);
});

Deno.test("normalizes only requested fields and trims values", () => {
  const result = normalizeShareProfile(
    { name: "  Lee  ", email: " lee@example.com ", phone: "01012345678", privateNote: "must not leak" },
    ["name", "email", "name"],
  );
  assertEquals(result.fields, ["name", "email"]);
  assertEquals(result.profile, { name: "Lee", email: "lee@example.com" });
  assertEquals("privateNote" in result.profile, false);
});

Deno.test("requires a non-empty name and selected name field", () => {
  assertThrows(() => normalizeShareProfile({ name: "Lee" }, ["email"]), Error, "이름은 공개 필수 항목");
  assertThrows(() => normalizeShareProfile({ name: "  " }, ["name"]), Error, "이름을 입력");
  assertThrows(() => normalizeShareProfile({}, ["name"]), Error, "이름을 입력");
});

Deno.test("rejects unknown fields and malformed request shapes", () => {
  assertThrows(() => normalizeShareProfile({ name: "Lee" }, ["name", "admin"]), Error, "허용되지 않은");
  assertThrows(() => normalizeShareProfile({ name: "Lee" }, []), Error, "프로필과 공개할 항목");
  assertThrows(() => normalizeShareProfile([], ["name"]), Error, "프로필과 공개할 항목");
});

Deno.test("validates email and blocks non-web URL schemes", () => {
  assertThrows(() => normalizeShareProfile({ name: "Lee", email: "bad" }, ["name", "email"]), Error, "이메일 형식");
  assertThrows(() => normalizeShareProfile({ name: "Lee", website: "javascript:alert(1)" }, ["name", "website"]), Error, "HTTP 또는 HTTPS");
  assertThrows(() => normalizeShareProfile({ name: "Lee", website: "not a URL" }, ["name", "website"]), Error, "웹사이트 주소");
});

Deno.test("enforces per-field length limits", () => {
  assertThrows(() => normalizeShareProfile({ name: "N".repeat(121) }, ["name"]), Error, "허용 길이");
  assertThrows(() => normalizeShareProfile({ name: "Lee", bio: "B".repeat(501) }, ["name", "bio"]), Error, "허용 길이");
});

Deno.test("omits blank optional values instead of exposing placeholders", () => {
  const result = normalizeShareProfile({ name: "Lee", company: "   " }, ["name", "company"]);
  assertEquals(result.profile, { name: "Lee" });
  assertEquals(result.fields, ["name", "company"]);
});
