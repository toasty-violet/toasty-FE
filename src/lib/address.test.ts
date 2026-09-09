import { describe, expect, it } from "vitest";

import { formatAddress, isCompleteAddress, type DraftAddress } from "./address";

const BASE: DraftAddress = {
  postalCode: "06236",
  roadAddress: "서울 강남구 테헤란로 152",
  jibunAddress: "서울 강남구 역삼동 737",
  addressType: "R",
  buildingName: "강남파이낸스센터",
  legalDong: "역삼동",
  detailAddress: "10층 1001호",
};

describe("formatAddress", () => {
  it("도로명을 고르면 참고항목을 괄호로 덧붙인다", () => {
    expect(formatAddress(BASE)).toBe(
      "서울 강남구 테헤란로 152 (역삼동, 강남파이낸스센터)",
    );
  });

  it("지번을 고르면 참고항목 없이 지번 주소만 쓴다", () => {
    expect(formatAddress({ ...BASE, addressType: "J" })).toBe(
      "서울 강남구 역삼동 737",
    );
  });

  it("참고항목이 없는 도로명은 주소만 쓴다", () => {
    expect(formatAddress({ ...BASE, legalDong: "", buildingName: "" })).toBe(
      "서울 강남구 테헤란로 152",
    );
  });

  it("참고항목이 한쪽만 있으면 그것만 덧붙인다", () => {
    expect(formatAddress({ ...BASE, buildingName: "" })).toBe(
      "서울 강남구 테헤란로 152 (역삼동)",
    );
  });

  it("우편번호 검색을 아직 하지 않았으면 빈 문자열이다", () => {
    expect(
      formatAddress({
        postalCode: "",
        roadAddress: "",
        jibunAddress: "",
        addressType: "",
        buildingName: "",
        legalDong: "",
        detailAddress: "",
      }),
    ).toBe("");
  });
});

describe("isCompleteAddress", () => {
  it("우편번호와 주소 종류가 모두 있으면 확정된 배송지다", () => {
    expect(isCompleteAddress(BASE)).toBe(true);
  });

  it("우편번호 검색을 아직 하지 않았으면 확정되지 않았다", () => {
    expect(isCompleteAddress({ ...BASE, postalCode: "" })).toBe(false);
    expect(isCompleteAddress({ ...BASE, addressType: "" })).toBe(false);
  });
});
