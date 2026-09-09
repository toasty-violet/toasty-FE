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

// 셀러 입점 신청에 보낼 정보
export interface SellerOnboardingRequest {
  shopName: string;
  description: string;
  shopImageObjectKey: string;
  sellerName: string;
  phoneNumber: string;
  /** 선택 입력이라 비어 있을 수 있다. */
  businessNumber: string;
  /** KAKAO_BANK 같은 은행 코드. */
  bank: string;
  accountNumber: string;
}

// 셀러 입점 신청 API 응답. data 는 안내 문구라 화면에서 쓰지 않는다
export type SellerOnboardingResponse = ApiSuccess<string>;

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

// 구매자의 기본 정보.
// 온보딩 등록, 마이페이지 조회·수정이 모두 같은 형태를 주고받는다.
export interface CustomerProfile {
  name: string;
  nickname: string;
  phoneNumber: string;
  address: CustomerAddress;
}

// 구매자 온보딩에 보내는 정보. 기본 정보와 결제 세션을 한 번에 제출한다.
export interface CustomerOnboardingPayload extends CustomerProfile {
  sessionId: string;
}

// 구매자 온보딩 API 응답
export type CustomerOnboardingResponse = ApiSuccess<string>;

// 구매자 정보 조회 API 응답
export type CustomerProfileResponse = ApiSuccess<CustomerProfile>;

// 구매자 정보 수정 API 응답
export type CustomerProfileUpdateResponse = ApiSuccess<string>;
