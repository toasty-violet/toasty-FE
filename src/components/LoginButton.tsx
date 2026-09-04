"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { clearSession, logout } from "@/lib/auth";

export function LoginButton() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  //로그인 상태면 로그아웃, 아니면 로그인 페이지로 이동
  const handleClick = () => {
    if (isLoggedIn) {
      logout().finally(() => clearSession());
      return;
    }

    router.push("/login");
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
