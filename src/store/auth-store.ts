import { create } from "zustand";

// loading: 부팅 중이라 로그인 여부를 아직 모름 / authed: 로그인됨 / guest: 비로그인 확정
export type AuthStatus = "loading" | "authed" | "guest";

interface AuthState {
  accessToken: string | null;
  status: AuthStatus;
  isLoggedIn: boolean;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

//로그인 후 토큰 및 인증 상태를 zustand 스토어로 관리
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  status: "loading",
  isLoggedIn: false,
  setAccessToken: (accessToken) =>
    set({ accessToken, status: "authed", isLoggedIn: true }),
  // 로그아웃 및 재발급 실패로 비로그인이 확정된 경우 모두 이 경로를 쓴다
  clearAuth: () =>
    set({ accessToken: null, status: "guest", isLoggedIn: false }),
}));
