import type { ApiSuccess } from "@/types/api";

export type UserRole = "SELLER" | "CUSTOMER";

// /users/role 에서 내려주는 유저 정보
// 역할을 아직 고르지 않은 유저는 role 이 아예 내려오지 않는다
export interface User {
  role?: UserRole | null;
}

// 역할 조회 API 응답
export type UserRoleResponse = ApiSuccess<User>;

// 닉네임·스토어 이름 중복 조회 API 응답. 둘이 같은 형태를 준다
export type DuplicationResponse = ApiSuccess<{ duplicated: boolean }>;

// 추천 닉네임 발급 API 응답
export type NicknameSuggestionResponse = ApiSuccess<{ nickname: string }>;

// 추천 스토어 이름 발급 API 응답
export type ShopNameSuggestionResponse = ApiSuccess<{ shopName: string }>;

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

// 셀러 스토어의 판매 내역 집계
export interface SellerSalesSummary {
  totalSalesCount: number;
  totalBuyerCount: number;
  totalSalesAmount: number;
}

// 셀러가 설정한 배송비
export interface SellerShippingFee {
  baseShippingFee: number;
  freeShippingThreshold: number;
  remoteAreaShippingFee: number;
}

// 셀러 스토어 홈 한 화면. 프로필·판매 요약·배송비가 함께 내려온다.
export interface SellerShop {
  sellerId: number;
  /** 사진을 등록하지 않았으면 null 이다. */
  shopImageUrl: string | null;
  /** 수정에 그대로 실어 보내라고 조회가 함께 내려주는 키. 사진이 없으면 null 이다. */
  shopImageObjectKey: string | null;
  shopName: string;
  followerCount: number;
  productCount: number;
  description: string;
  salesSummary: SellerSalesSummary;
  shippingFee: SellerShippingFee;
}

// 셀러 스토어 정보 조회 API 응답
export type SellerShopResponse = ApiSuccess<SellerShop>;

/**
 * 스토어 정보 수정에 보낼 값. 조회(SellerShop)와 달리 배송비가 중첩되지 않고
 * 같은 높이에 온다. 사진을 바꾸지 않아도 지금 사진의 objectKey 를 함께 보내야
 * 한다. 빼고 보내면 서버가 사진을 지운다.
 */
export interface SellerShopUpdateRequest extends SellerShippingFee {
  shopName: string;
  description: string;
  shopImageObjectKey: string;
}

// 스토어 정보 수정 API 응답
export type SellerShopUpdateResponse = ApiSuccess<string>;

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
