import type { ApiSuccess } from "@/types/api";

export type UserRole = "SELLER" | "CUSTOMER";

// /users/me 에서 내려주는 유저 정보
// 역할을 아직 고르지 않은 유저는 role 이 아예 내려오지 않는다
export interface User {
  role?: UserRole | null;
  nickname: string;
}

// 내 정보 조회 API 응답
export type MeResponse = ApiSuccess<User>;

// 닉네임 중복 조회 API 응답
export type NicknameDuplicationResponse = ApiSuccess<{ duplicated: boolean }>;

// 배송지. 카카오 우편번호에서 받은 값을 필드별로 나눠 보낸다.
export interface CustomerAddress {
  postalCode: string;
  roadAddress: string;
  jibunAddress: string;
  addressType: "R" | "J";
  buildingName: string;
  legalDong: string;
  detailAddress: string;
}

// 구매자 온보딩 1단계에서 입력받는 기본 정보.
// 결제 등록까지 마쳐야 제출하므로, 그 전까지는 세션 스토리지에서 임시 보관한다.
export interface CustomerOnboardingDraft {
  name: string;
  nickname: string;
  phoneNumber: string;
  address: CustomerAddress;
}

// 구매자 온보딩에 보내는 정보. 기본 정보와 결제 세션을 한 번에 제출한다.
export interface CustomerOnboardingPayload extends CustomerOnboardingDraft {
  sessionId: string;
}

// 구매자 온보딩 API 응답
export type CustomerOnboardingResponse = ApiSuccess<string>;
