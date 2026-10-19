export type CardCategory = "business" | "creative" | "personal";

export interface CardRecord {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  bio: string;
  category: CardCategory;
  theme: "dark" | "light" | "violet";
  createdAt: string;
  updatedAt: string;
}

export type CardInput = Omit<CardRecord, "id" | "createdAt" | "updatedAt">;

const STORAGE_KEY = "wallet-card-studio.cards.v1";

export const starterCards: CardRecord[] = [
  {
    id: "sample-1", name: "Alex Morgan", role: "Product Designer",
    company: "Northstar Studio", email: "alex@example.com", phone: "+1 415 555 0134",
    website: "https://example.com", location: "San Francisco, CA",
    bio: "Designing thoughtful digital experiences.", category: "creative", theme: "violet",
    createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "sample-2", name: "Jamie Chen", role: "Founder & CEO",
    company: "Fieldwork", email: "jamie@example.com", phone: "+1 212 555 0188",
    website: "https://example.com", location: "New York, NY",
    bio: "Building tools for teams that make things.", category: "business", theme: "dark",
    createdAt: "2026-01-02T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z"
  },
  {
    id: "sample-3", name: "Taylor Rivera", role: "Independent Artist",
    company: "Studio TR", email: "taylor@example.com", phone: "+34 600 000 000",
    website: "https://example.com", location: "Barcelona, Spain",
    bio: "Illustration, objects and visual stories.", category: "personal", theme: "light",
    createdAt: "2026-01-03T00:00:00.000Z", updatedAt: "2026-01-03T00:00:00.000Z"
  }
];

export function validateCard(input: CardInput): string[] {
  const errors: string[] = [];
  if (!input.name.trim()) errors.push("이름을 입력해 주세요.");
  if (input.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.push("이메일 형식을 확인해 주세요.");
  }
  if (input.website.trim()) {
    try {
      const parsed = new URL(input.website.trim());
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") errors.push("웹사이트는 http 또는 https 주소여야 합니다.");
    } catch {
      errors.push("웹사이트 주소를 확인해 주세요. 예: https://example.com");
    }
  }
  return errors;
}

export function createCard(input: CardInput, now = new Date()): CardRecord {
  const timestamp = now.toISOString();
  return { ...input, id: crypto.randomUUID(), createdAt: timestamp, updatedAt: timestamp };
}

export function loadCards(): CardRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...starterCards];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...starterCards];
    return parsed.filter((item): item is CardRecord =>
      typeof item === "object" && item !== null &&
      typeof (item as CardRecord).id === "string" &&
      typeof (item as CardRecord).name === "string"
    );
  } catch {
    return [...starterCards];
  }
}

export function saveCards(cards: CardRecord[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    return true;
  } catch {
    return false;
  }
}

function escapeVCard(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function toVCard(card: CardRecord): string {
  const lines = [
    "BEGIN:VCARD", "VERSION:3.0",
    `FN:${escapeVCard(card.name)}`,
    card.role ? `TITLE:${escapeVCard(card.role)}` : "",
    card.company ? `ORG:${escapeVCard(card.company)}` : "",
    card.phone ? `TEL;TYPE=CELL:${escapeVCard(card.phone)}` : "",
    card.email ? `EMAIL;TYPE=INTERNET:${escapeVCard(card.email)}` : "",
    card.website ? `URL:${escapeVCard(card.website)}` : "",
    card.location ? `ADR;TYPE=WORK:;;${escapeVCard(card.location)};;;;` : "",
    card.bio ? `NOTE:${escapeVCard(card.bio)}` : "",
    "END:VCARD"
  ];
  return lines.filter(Boolean).join("\r\n");
}
