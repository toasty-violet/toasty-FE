import type { ApiResponse } from "@/types/api";

// 로그인 후 받은 유저 데이터
export interface UserData {
  isOnboardingCompleted: boolean;
  accessToken: string;
}

// 카카오 로그인 API 응답
export type KakaoLoginResponse = ApiResponse<UserData>;

// accessToken 재발급 데이터
export interface RefreshData {
  accessToken: string;
}

// accessToken 재발급 API 응답
export type RefreshResponse = ApiResponse<RefreshData>;

// 로그아웃 API 응답
export type LogoutResponse = ApiResponse<string>;
