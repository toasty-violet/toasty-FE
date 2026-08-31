"use client";

import { useEffect } from "react";
import { refreshAccessToken } from "@/lib/auth";

//앱 최초 진입/새로고침 시 refreshToken 쿠키로 accessToken을 재발급받아 zustand에 채워둠
//성공 시 스토어 갱신은 refreshAccessToken 내부에서 처리된다
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    refreshAccessToken().catch(() => {});
  }, []);

  return children;
}
