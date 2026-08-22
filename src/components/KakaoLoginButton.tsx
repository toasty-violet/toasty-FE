"use client";

import { getKakaoAuthUrl } from "@/lib/kakao";

export function KakaoLoginButton() {
  const handleClick = () => {
    window.location.href = getKakaoAuthUrl();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-100"
    >
      로그인
    </button>
  );
}
