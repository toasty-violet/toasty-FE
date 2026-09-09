import { apiClient } from "@/lib/api-client";
import type {
  CustomerOnboardingPayload,
  CustomerOnboardingResponse,
  CustomerProfileResponse,
  MeResponse,
  NicknameDuplicationResponse,
  SellerOnboardingRequest,
  SellerOnboardingResponse,
} from "@/types/user";

//내 정보(role, nickname) 조회
export async function fetchMe() {
  const { data } = await apiClient.get<MeResponse>("/users/me");

  return data.data;
}

//마이페이지에 띄울 구매자 정보(이름, 닉네임, 연락처, 배송지) 조회
export async function fetchCustomerProfile() {
  const { data } =
    await apiClient.get<CustomerProfileResponse>("/customers/profile");

  return data.data;
}

//닉네임 중복 여부 조회
export async function fetchNicknameDuplicated(nickname: string) {
  const { data } = await apiClient.get<NicknameDuplicationResponse>(
    "/search-nickname",
    { params: { nickname } },
  );

  return data.data.duplicated;
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
