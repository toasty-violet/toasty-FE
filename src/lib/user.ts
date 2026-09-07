import { apiClient } from "@/lib/api-client";
import type {
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

//닉네임 중복 여부 조회
export async function fetchNicknameDuplicated(nickname: string) {
  const { data } = await apiClient.get<NicknameDuplicationResponse>(
    "/search-nickname",
    { params: { nickname } },
  );

  return data.data.duplicated;
}

//셀러 입점 신청. 성공하면 유저의 role 이 SELLER 로 바뀐다
export async function submitSellerOnboarding(body: SellerOnboardingRequest) {
  await apiClient.put<SellerOnboardingResponse>(
    "/users/onboarding/seller",
    body,
  );
}
