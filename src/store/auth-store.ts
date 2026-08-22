import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  isLoggedIn: boolean;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

//로그인 후 유저 정보 및 토큰을 zustand 스토어로 관리
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isLoggedIn: false,
  setAccessToken: (accessToken) => set({ accessToken, isLoggedIn: true }),
  clearAuth: () => set({ accessToken: null, isLoggedIn: false }),
}));
