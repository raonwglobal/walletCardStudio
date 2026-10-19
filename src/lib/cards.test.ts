import { describe, expect, it } from "vitest";
import { starterCards, toVCard, validateCard } from "./cards";

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

describe("toVCard", () => {
  it("creates a vCard payload and escapes commas", () => {
    const result = toVCard({ ...starterCards[0], name: "Alex, Morgan" });
    expect(result).toContain("BEGIN:VCARD");
    expect(result).toContain("FN:Alex\\, Morgan");
    expect(result).toContain("END:VCARD");
  });
});
