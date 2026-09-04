"use client";

import { getKakaoAuthUrl } from "@/lib/kakao";
import KakaoIcon from "@/assets/kakao-icon.svg";

export function KakaoLoginButton() {
  const handleClick = () => {
    window.location.href = getKakaoAuthUrl();
  };

  return (
    <div className="flex h-fit w-full flex-col gap-12 px-20 pt-10 pb-20">
      <button
        type="button"
        onClick={handleClick}
        className="text-l1-semibold text-fg-neutral-solid rounded-12 flex h-[5.6rem] w-full items-center justify-center gap-6 bg-[#FEE500] px-24 transition-colors hover:bg-[#FEE500F0]"
      >
        <KakaoIcon className="size-[2.2rem]" />
        Kakao로 시작하기
      </button>
    </div>
  );
}
