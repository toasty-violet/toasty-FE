import { apiClient } from "@/lib/api-client";
import type { MeResponse, NicknameDuplicationResponse } from "@/types/user";

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
