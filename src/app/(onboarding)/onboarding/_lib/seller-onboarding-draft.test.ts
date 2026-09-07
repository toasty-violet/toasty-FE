import { beforeEach, describe, expect, it } from "vitest";

import {
  EMPTY_DRAFT,
  clearSellerDraft,
  hasSellerInfoStep,
  readSellerDraft,
  saveSellerDraft,
} from "./seller-onboarding-draft";

// info-1 을 통과한 초안. 이 상태여야 info-2 에 머무를 수 있다.
const INFO_STEP_DONE = {
  ...EMPTY_DRAFT,
  shopName: "토스티상회",
  description: "직접 구운 빵을 팝니다",
  shopImageObjectKey: "shops/abc.png",
};

beforeEach(() => {
  sessionStorage.clear();
});

describe("hasSellerInfoStep", () => {
  it("사진·이름·소개가 모두 채워지면 1단계를 마친 것으로 본다", () => {
    expect(hasSellerInfoStep(INFO_STEP_DONE)).toBe(true);
  });

  it("빈 초안은 1단계를 마치지 않은 것으로 본다", () => {
    expect(hasSellerInfoStep(EMPTY_DRAFT)).toBe(false);
  });

  // info-2 가 이 판정으로 진입을 막으므로, 하나라도 비면 통과시키면 안 된다.
  it.each(["shopName", "description", "shopImageObjectKey"] as const)(
    "%s 가 비면 1단계를 마치지 않은 것으로 본다",
    (field) => {
      expect(hasSellerInfoStep({ ...INFO_STEP_DONE, [field]: "" })).toBe(false);
    },
  );

  it("소개가 공백뿐이면 채운 것으로 보지 않는다", () => {
    expect(hasSellerInfoStep({ ...INFO_STEP_DONE, description: "   " })).toBe(
      false,
    );
  });
});

describe("셀러 초안 보관", () => {
  it("저장한 값을 그대로 되살린다", () => {
    saveSellerDraft(INFO_STEP_DONE);

    expect(readSellerDraft()).toEqual(INFO_STEP_DONE);
  });

  it("일부만 저장하면 기존 값에 덧씌운다", () => {
    saveSellerDraft(INFO_STEP_DONE);
    saveSellerDraft({ accountNumber: "1234567890" });

    expect(readSellerDraft()).toEqual({
      ...INFO_STEP_DONE,
      accountNumber: "1234567890",
    });
  });

  it("저장한 적이 없으면 빈 초안을 준다", () => {
    expect(readSellerDraft()).toEqual(EMPTY_DRAFT);
  });

  // 사용자가 직접 건드릴 수 있는 값이라 깨져 있어도 화면이 죽으면 안 된다.
  it("깨진 JSON 이 들어 있어도 빈 초안으로 이어간다", () => {
    sessionStorage.setItem("seller-onboarding-draft", "{not-json");

    expect(readSellerDraft()).toEqual(EMPTY_DRAFT);
  });

  it("비우면 빈 초안으로 돌아간다", () => {
    saveSellerDraft(INFO_STEP_DONE);
    clearSellerDraft();

    expect(readSellerDraft()).toEqual(EMPTY_DRAFT);
  });
});
