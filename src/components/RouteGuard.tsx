"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";
import { homePathFor } from "@/lib/routes";
import type { UserRole } from "@/types/user";

// 역할까지 요구할지, 로그인만 요구할지, 아직 역할을 고르지 않았기를 요구할지,
// 반대로 비로그인이어야 하는지(로그인 화면)
export type RouteRequirement = UserRole | "authed" | "onboarding" | "guest";

interface RouteGuardProps {
  require: RouteRequirement;
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
  const isAllowed =
    require === "guest"
      ? status === "guest"
      : status === "authed" &&
        !!user &&
        (require === "authed" ||
          // 역할 미선택 유저는 role 키 자체가 없어 undefined 로 들어온다
          (require === "onboarding" ? !user.role : user.role === require));

  useEffect(() => {
    if (isPending || isAllowed) {
      return;
    }
    // 렌더 중이 아니라 이펙트에서 이동시킨다.
    // 로그인은 했는데 권한이 안 맞는 경우엔 홈을 거치지 않고 제 역할의 화면으로 바로 보낸다.
    // 비로그인 전용 화면(로그인 페이지)에 로그인한 채로 오면 /login 으로 되돌려 무한 루프가 되므로
    // 그때는 언제나 제 역할의 화면으로 보낸다
    router.replace(
      status === "guest" && require !== "guest" ? "/login" : homePathFor(user),
    );
  }, [status, isPending, isAllowed, require, user, router]);

  if (!isAllowed) {
    return (
      <p className="p-4 text-center text-sm text-zinc-500">
        {isPending ? "불러오는 중입니다..." : "이동 중입니다..."}
      </p>
    );
  }

  return children;
}
