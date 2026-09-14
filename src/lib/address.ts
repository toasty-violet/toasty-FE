import type { CustomerAddress } from "@/types/user";

/** 아직 우편번호 검색을 마치지 않아 주소 종류가 비어 있을 수 있는 배송지. */
export type DraftAddress = Omit<CustomerAddress, "addressType"> & {
  addressType: CustomerAddress["addressType"] | "";
};

/** 우편번호 검색을 마쳐 그대로 제출할 수 있는 배송지인지 확인한다. */
export function isCompleteAddress(
  address: DraftAddress,
): address is CustomerAddress {
  return address.postalCode !== "" && address.addressType !== "";
}

/**
 * 배송지를 한 줄로 보여줄 문자열.
 * API 로는 필드를 나눠 주고받으므로, 조합은 표시 용도로만 쓴다.
 */
export function formatAddress(address: DraftAddress) {
  const base =
    address.addressType === "J" ? address.jibunAddress : address.roadAddress;
  if (base === "") return "";

  // 도로명 주소를 고른 경우에만 참고항목(법정동, 건물명)을 괄호로 덧붙인다.
  if (address.addressType !== "R") return base;

  const parts = [address.legalDong, address.buildingName].filter(
    (part) => part !== "",
  );

  return parts.length > 0 ? `${base} (${parts.join(", ")})` : base;
}
