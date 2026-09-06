"use client";

import { useRouter } from "next/navigation";

import CheckRoundIcon from "@/assets/CheckRound.svg";
import { BottomButton } from "@/components/buttons/BottomButton";
import { Header } from "@/components/headers/Header";

//구매자 온보딩을 마쳤음을 알리는 화면
export default function OnboardingCustomerCompletePage() {
  const router = useRouter();

  return (
    <>
      {/* (customer) 레이아웃은 헤더를 그리지 않으므로 페이지가 직접 얹는다. */}
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-28 p-20">
          {/* 원형 배경과 체크 표시가 아이콘 하나에 함께 들어 있다. */}
          <CheckRoundIcon className="size-[7.2rem]" />

          <div className="flex w-full flex-col items-center gap-8 text-center">
            <h1 className="text-t2-bold text-fg-neutral-solid">
              회원가입이 완료되었습니다!
            </h1>
            <p className="text-b1-reading-medium text-fg-neutral-primary">
              이제 다양한 라이브를 만나보세요.
            </p>
          </div>
        </div>

        <BottomButton label="확인" onClick={() => router.replace("/")} />
      </main>
    </>
  );
}
