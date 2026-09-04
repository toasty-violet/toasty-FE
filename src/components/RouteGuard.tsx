"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";
import type { UserRole } from "@/types/user";

interface RouteGuardProps {
  require: UserRole;
  children: React.ReactNode;
}

//유저의 role에 따라 페이지를 감싸는 가드, 권한이 없는 페이지 진입을 막는 장치
export function RouteGuard({ require, children }: RouteGuardProps) {
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const user = useUserStore((state) => state.user);

  // 토큰이 먼저 들어오고 /users/me 는 뒤에 도착한다.
  // 그 사이(authed 인데 user 가 아직 null)를 판정 완료로 보면 권한이 있는데도 쫓아낸다.
  const isPending = status === "loading" || (status === "authed" && !user);
  const isAllowed = status === "authed" && user?.role === require;

  useEffect(() => {
    if (isPending || isAllowed) {
      return;
    }
    // 렌더 중이 아니라 이펙트에서 이동시킨다
    router.replace(status === "guest" ? "/login" : "/");
  }, [status, isPending, isAllowed, router]);

  if (!isAllowed) {
    return (
      <p className="p-4 text-center text-sm text-zinc-500">
        {isPending ? "불러오는 중입니다..." : "이동 중입니다..."}
      </p>
    );
  }

  return children;
}
