import { apiClient, requestRefresh } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";
import type { KakaoLoginResponse, LogoutResponse } from "@/types/auth";

//카카오 로그인 요청
export async function loginWithKakao(code: string) {
  const { data } = await apiClient.get<KakaoLoginResponse>("/login/kakao", {
    params: { code },
  });

  return data;
}

//로그아웃 요청 (refreshToken 쿠키 만료 처리)
export async function logout() {
  const { data } = await apiClient.post<LogoutResponse>("/logout");

  return data;
}

//토큰과 유저 정보를 함께 비운다.
export function clearSession() {
  useAuthStore.getState().clearAuth();
  useUserStore.getState().clearUser();
}

//refreshToken 쿠키로 accessToken 재발급 요청 (인터셉터와 같은 Promise를 공유)
export { requestRefresh as refreshAccessToken };
