import { describe, expect, it } from "vitest";

import { formatThousand } from "./format";

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
