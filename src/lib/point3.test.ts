import { describe, expect, it } from "vitest";

import { resolvePoint3FailMessage } from "./point3";

describe("resolvePoint3FailMessage", () => {
  it("창을 닫은 것은 실패가 아니므로 아무것도 띄우지 않는다", () => {
    expect(resolvePoint3FailMessage("PAYMENT_WINDOW_CLOSED")).toBe("");
  });

  it("세션이 만료·무효면 재시도를 안내한다", () => {
    expect(resolvePoint3FailMessage("SESSION_EXPIRED")).toBe(
      "계좌 등록 시간이 만료됐어요. 다시 시도해 주세요.",
    );
    expect(resolvePoint3FailMessage("INVALID_SESSION")).toBe(
      "계좌 등록 시간이 만료됐어요. 다시 시도해 주세요.",
    );
  });

  it("비활성 계정은 재시도로 풀리지 않으므로 문의를 안내한다", () => {
    expect(resolvePoint3FailMessage("PAYER_DEACTIVATED")).toBe(
      "사용할 수 없는 계정이에요. 고객센터에 문의해 주세요.",
    );
  });

  it("문서에 없는 코드는 일반 실패로 안내한다", () => {
    expect(resolvePoint3FailMessage("SOMETHING_ELSE")).toBe(
      "계좌 등록에 실패했어요. 다시 시도해 주세요.",
    );
  });

  it("실패로 돌아온 것이 아니면 아무것도 띄우지 않는다", () => {
    expect(resolvePoint3FailMessage(null)).toBe("");
  });
});
