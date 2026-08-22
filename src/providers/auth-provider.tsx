"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { refreshAccessToken } from "@/lib/auth";

//앱 최초 진입/새로고침 시 refreshToken 쿠키로 accessToken을 재발급받아 zustand에 채워둠
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    refreshAccessToken()
      .then((response) => {
        if (response.success && response.data) {
          setAccessToken(response.data.accessToken);
        }
      })
      .catch(() => {});
  }, [setAccessToken]);

  return children;
}
