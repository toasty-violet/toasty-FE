import { apiClient } from "@/lib/api-client";
import type {
  CustomerOnboardingPayload,
  CustomerOnboardingResponse,
  CustomerProfile,
  CustomerProfileResponse,
  CustomerProfileUpdateResponse,
  DuplicationResponse,
  NicknameSuggestionResponse,
  SellerOnboardingRequest,
  SellerOnboardingResponse,
  SellerShopResponse,
  SellerShopUpdateRequest,
  SellerShopUpdateResponse,
  ShopNameSuggestionResponse,
  UserRoleResponse,
} from "@/types/user";

//내 역할 조회
export async function fetchRole() {
  const { data } = await apiClient.get<UserRoleResponse>("/users/role");

  return data.data;
}

//마이페이지에 띄울 구매자 정보(이름, 닉네임, 연락처, 배송지) 조회
export async function fetchCustomerProfile() {
  const { data } =
    await apiClient.get<CustomerProfileResponse>("/customers/profile");

  return data.data;
}

//구매자 마이페이지에서 회원 정보 수정
export async function updateCustomerProfile(profile: CustomerProfile) {
  await apiClient.put<CustomerProfileUpdateResponse>(
    "/customers/profile",
    profile,
  );
}

//구매자 닉네임 중복 여부 조회. 스토어 이름과 이름 공간이 달라 서로 겹쳐도 중복이 아니다
export async function fetchNicknameDuplicated(nickname: string) {
  const { data } = await apiClient.get<DuplicationResponse>(
    "/customers/nickname",
    { params: { nickname } },
  );

  return data.data.duplicated;
}

//셀러 스토어 홈에 띄울 정보(프로필, 판매 요약, 배송비) 조회
export async function fetchSellerShop() {
  const { data } = await apiClient.get<SellerShopResponse>("/sellers/shop");

  return data.data;
}

//셀러 스토어 정보(사진, 이름, 소개, 배송비) 수정
export async function updateSellerShop(body: SellerShopUpdateRequest) {
  await apiClient.put<SellerShopUpdateResponse>("/sellers/shop", body);
}

//셀러 스토어 이름 중복 여부 조회
export async function fetchShopNameDuplicated(shopName: string) {
  const { data } = await apiClient.get<DuplicationResponse>(
    "/sellers/shop-name",
    { params: { shopName } },
  );

  return data.data.duplicated;
}

//온보딩 입력창에 채워 둘 추천 닉네임 발급. 자리를 잡아두지는 않아 제출 때 중복될 수 있다
export async function fetchSuggestedNickname() {
  const { data } = await apiClient.get<NicknameSuggestionResponse>(
    "/customers/nickname/suggestion",
  );

  return data.data.nickname;
}

//온보딩 입력창에 채워 둘 추천 스토어 이름 발급
export async function fetchSuggestedShopName() {
  const { data } = await apiClient.get<ShopNameSuggestionResponse>(
    "/sellers/shop-name/suggestion",
  );

  return data.data.shopName;
}

//구매자 온보딩. 닉네임은 가입 시 자동 생성되므로 등록이 아니라 수정이다.
export async function submitCustomerOnboarding(
  payload: CustomerOnboardingPayload,
) {
  const { data } = await apiClient.put<CustomerOnboardingResponse>(
    "/users/onboarding/customer",
    payload,
  );

  return data.data;
}

//셀러 입점 신청. 성공하면 유저의 role 이 SELLER 로 바뀐다
export async function submitSellerOnboarding(body: SellerOnboardingRequest) {
  await apiClient.put<SellerOnboardingResponse>(
    "/users/onboarding/seller",
    body,
  );
}
