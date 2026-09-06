"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";
import { loginWithKakao } from "@/lib/auth";
import { fetchMe } from "@/lib/user";
import { ApiRequestError } from "@/lib/api-error";

//카카오 로그인 시 콜백 페이지
/* 카카오 로그인 버튼 클릭시 카카오 인증페이지로 이동합니다.
 * 카카오 인증에 성공하면 해당 페이지로 응답과 함께 리다이렉트 됩니다.
 * toasty 백엔드 서버로 카카오 토큰을 전송합니다.
 */
function KakaoCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useUserStore((state) => state.setUser);
  const code = searchParams.get("code");
  const [error, setError] = useState<string | null>(
    code ? null : "카카오 인가 코드가 없습니다.",
  );
  const requestedRef = useRef(false);

  useEffect(() => {
    if (!code || requestedRef.current) {
      return;
    }
    requestedRef.current = true;

    loginWithKakao(code)
      .then((response) => {
        setAccessToken(response.data.accessToken);
        // 로그인 후 /users/me api를 호출해 페이지 가드가 작동하도록 한다.
        return fetchMe();
      })
      .then((user) => {
        setUser(user);
        router.replace("/");
      })
      .catch((error: unknown) => {
        // 실패 응답은 인터셉터가 ApiRequestError 로 바꿔 던지므로 서버 문구를 여기서 쓴다
        setError(
          error instanceof ApiRequestError
            ? error.message
            : "로그인 중 오류가 발생했습니다.",
        );
      });
  }, [code, setAccessToken, setUser, router]);

  if (error) {
    return <p className="p-4 text-center text-sm text-red-500">{error}</p>;
  }

  return (
    <p className="p-4 text-center text-sm text-zinc-500">
      로그인 처리 중입니다...
    </p>
  );
}

export default function KakaoCallbackPage() {
  return (
    <Suspense>
      <KakaoCallbackContent />
    </Suspense>
  );
}
