import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadCards, saveCards, starterCards, toVCard, validateCard } from "./cards";

describe("validateCard", () => {
  it("requires a name", () => {
    expect(validateCard({ ...starterCards[0], name: "" })).toContain("이름을 입력해 주세요.");
  });

  it("rejects invalid email and non-http website protocols", () => {
    const errors = validateCard({ ...starterCards[0], email: "not-an-email", website: "javascript:alert(1)" });
    expect(errors).toContain("이메일 형식을 확인해 주세요.");
    expect(errors).toContain("웹사이트는 http 또는 https 주소여야 합니다.");
  });

  it("accepts valid card fields", () => {
    expect(validateCard(starterCards[0])).toEqual([]);
  });
});

describe("browser storage resilience", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("falls back to starter cards when stored JSON is malformed", () => {
    window.localStorage.setItem("wallet-card-studio.cards.v1", "{invalid");
    expect(loadCards()).toEqual(starterCards);
  });

  it("reports a failed save when localStorage throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });
    expect(saveCards(starterCards)).toBe(false);
  });
});

describe("toVCard", () => {
  it("creates a vCard payload and escapes commas", () => {
    const result = toVCard({ ...starterCards[0], name: "Alex, Morgan" });
    expect(result).toContain("BEGIN:VCARD");
    expect(result).toContain("FN:Alex\\, Morgan");
    expect(result).toContain("END:VCARD");
  });

  it("escapes CRLF characters to prevent injected vCard fields", () => {
    const result = toVCard({ ...starterCards[0], name: "Alex\r\nTEL;TYPE=CELL:+123456" });
    expect(result).toContain("FN:Alex\\nTEL\\;TYPE=CELL:+123456");
    expect(result).not.toContain("FN:Alex\r\nTEL;TYPE=CELL:+123456");
  });
});
