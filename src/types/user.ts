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
