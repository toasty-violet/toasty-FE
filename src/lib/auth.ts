import { apiClient } from "@/lib/api-client";
import type { KakaoLoginResponse, RefreshResponse } from "@/types/auth";

//카카오 로그인 요청
export async function loginWithKakao(code: string) {
  const { data } = await apiClient.get<KakaoLoginResponse>("/login/kakao", {
    params: { code },
  });

  return data;
}

//로그아웃 요청 (refreshToken 쿠키 만료 처리)
export async function logout() {
  await apiClient.post("/logout");
}

//refreshToken 쿠키로 accessToken 재발급 요청
export async function refreshAccessToken() {
  const { data } = await apiClient.post<RefreshResponse>("/refresh");

  return data;
}
