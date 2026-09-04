"use client";

import { getKakaoAuthUrl } from "@/lib/kakao";
import KakaoIcon from "@/assets/KakaoIcon.svg";

export function KakaoLoginButton() {
  const handleClick = () => {
    window.location.href = getKakaoAuthUrl();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-fg-neutral-solid flex h-fit w-[35rem] items-center justify-center gap-[0.8rem] rounded-[1.2rem] bg-[#FEE500] px-[2rem] py-[1.6rem] text-sm font-medium transition-colors hover:bg-[#FEE500F0]"
    >
      <KakaoIcon className="size-[2.4rem]" />
      Kakao로 시작하기
    </button>
  );
}
