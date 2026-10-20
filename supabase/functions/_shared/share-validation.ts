export const SHARE_FIELDS = ["name", "role", "company", "email", "phone", "website", "location", "bio"] as const;
export type ShareField = typeof SHARE_FIELDS[number];

const FIELD_LIMITS: Record<ShareField, number> = {
  name: 120,
  role: 120,
  company: 120,
  email: 254,
  phone: 64,
  website: 2048,
  location: 160,
  bio: 500,
};

export function isValidShareToken(token: unknown): token is string {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
}

export function normalizeShareProfile(input: unknown, requested: unknown): { fields: ShareField[]; profile: Record<string, string> } {
  if (!input || typeof input !== "object" || Array.isArray(input) || !Array.isArray(requested) || requested.length === 0) {
    throw new Error("프로필과 공개할 항목을 확인해 주세요.");
  }
  const fields: ShareField[] = [];
  for (const field of requested) {
    if (typeof field !== "string" || !SHARE_FIELDS.includes(field as ShareField)) {
      throw new Error("허용되지 않은 공개 항목입니다.");
    }
    if (!fields.includes(field as ShareField)) fields.push(field as ShareField);
  }
  if (!fields.includes("name")) throw new Error("이름은 공개 필수 항목입니다.");

  const source = input as Record<string, unknown>;
  const profile: Record<string, string> = {};
  for (const field of fields) {
    const raw = source[field];
    if (typeof raw !== "string") {
      if (field === "name") throw new Error("이름을 입력해 주세요.");
      continue;
    }
    const value = raw.trim();
    if (!value) {
      if (field === "name") throw new Error("이름을 입력해 주세요.");
      continue;
    }
    if (value.length > FIELD_LIMITS[field]) throw new Error(`${field} 항목이 허용 길이를 초과했습니다.`);
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error("이메일 형식이 올바르지 않습니다.");
    }
    if (field === "website") {
      let parsed: URL;
      try {
        parsed = new URL(value);
      } catch {
        throw new Error("웹사이트 주소가 올바르지 않습니다.");
      }
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("웹사이트는 HTTP 또는 HTTPS 주소여야 합니다.");
      }
    }
    profile[field] = value;
  }
  return { fields, profile };
}
