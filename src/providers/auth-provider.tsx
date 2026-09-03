"use client";

import { useEffect } from "react";
import { refreshAccessToken } from "@/lib/auth";
import { fetchMe } from "@/lib/user";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";

//앱 최초 진입/새로고침 시 refreshToken 쿠키로 accessToken을 재발급받고 이어서 내 정보를 채운다
//accessToken 갱신은 refreshAccessToken 내부에서 처리되므로 그다음에 fetchMe를 부를 수 있다
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    refreshAccessToken()
      .then(() => fetchMe())
      .then((user) => useUserStore.getState().setUser(user))
      // 실패 시 반드시 guest로 확정해야 한다. 그러지 않으면 status가 loading에 머물러 모든 가드가 멈춘다
      .catch(() => useAuthStore.getState().clearAuth());
  }, []);

  return children;
}
