import { describe, expect, it } from "vitest";

import { formatCountOrDash, formatThousand } from "./format";

describe("formatThousand", () => {
  it("1,000 단위마다 쉼표를 붙인다", () => {
    expect(formatThousand(3000)).toBe("3,000");
    expect(formatThousand(2345000)).toBe("2,345,000");
  });

  it("네 자리 미만은 그대로 둔다", () => {
    expect(formatThousand(0)).toBe("0");
    expect(formatThousand(312)).toBe("312");
  });
});

describe("formatCountOrDash", () => {
  it("값이 있으면 쉼표와 단위를 붙인다", () => {
    expect(formatCountOrDash(2345000, "원")).toBe("2,345,000원");
    expect(formatCountOrDash(312, "건")).toBe("312건");
  });

  it("단위를 넘기지 않으면 숫자만 적는다", () => {
    expect(formatCountOrDash(240)).toBe("240");
  });

  it("0 은 숫자 자리만 - 로 바꾸고 단위는 남긴다", () => {
    expect(formatCountOrDash(0, "원")).toBe("-원");
    expect(formatCountOrDash(0, "건")).toBe("-건");
  });

  it("못 받아온 값도 단위를 남긴다", () => {
    expect(formatCountOrDash(null, "원")).toBe("-원");
    expect(formatCountOrDash(undefined, "명")).toBe("-명");
  });

  it("단위가 없으면 - 만 적는다", () => {
    expect(formatCountOrDash(0)).toBe("-");
  });
});
