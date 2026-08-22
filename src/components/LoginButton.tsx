"use client";

import { useAuthStore } from "@/store/auth-store";
import { getKakaoAuthUrl } from "@/lib/kakao";

export function LoginButton() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  //로그인 상태면 로그아웃, 아니면 카카오 로그인 페이지로 이동
  const handleClick = () => {
    if (isLoggedIn) {
      clearAuth();
      return;
    }

    window.location.href = getKakaoAuthUrl();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-foreground text-background rounded-full px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
    >
      {isLoggedIn ? "로그아웃" : "로그인"}
    </button>
  );
}
