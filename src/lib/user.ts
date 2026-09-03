import { apiClient } from "@/lib/api-client";
import type { MeResponse } from "@/types/user";

//내 정보(role, nickname) 조회
export async function fetchMe() {
  const { data } = await apiClient.get<MeResponse>("/users/me");

  return data.data;
}
