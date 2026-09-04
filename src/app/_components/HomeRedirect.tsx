"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";

//홈에 도착한 유저를 역할에 맞는 화면으로 보낸다.
//SELLER 는 /shop, 역할 미선택은 /select-role, CUSTOMER 와 비로그인은 홈에 머문다.
export function HomeRedirect() {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const user = useUserStore((state) => state.user);

  // 토큰이 먼저 들어오고 /users/me 는 뒤에 도착하므로 그 사이에는 판단하지 않는다
  const isPending = status === "loading" || (status === "authed" && !user);

  useEffect(() => {
    if (isPending || status !== "authed" || !user) {
      return;
    }
    if (user.role === "SELLER") {
      router.replace("/shop");
      return;
    }
    // 역할 미선택 유저는 role 키 자체가 없어 undefined 로 들어온다
    if (!user.role) {
      router.replace("/select-role");
    }
  }, [isPending, status, user, router]);

  return null;
}
