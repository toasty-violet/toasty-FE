"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import CheckRoundIcon from "@/assets/CheckRound.svg";
import { BottomButton } from "@/components/buttons/BottomButton";
import { Header } from "@/components/headers/Header";
import { fetchRole } from "@/lib/user";
import { useUserStore } from "@/store/user-store";

type OnboardingCompleteProps = {
  title: string;
  description: string;
  /** 확인을 눌렀을 때 갈 곳. 역할별 첫 화면이다. */
  homePath: string;
};

//구매자·판매자 온보딩을 마쳤음을 알리는 화면
export function OnboardingComplete({
  title,
  description,
  homePath,
}: OnboardingCompleteProps) {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  // 온보딩으로 role 이 바뀌었으므로 새로 받아 둔다.
  // 온보딩 화면에서 미리 갱신하면 그쪽 가드가 먼저 반응해 여기까지 오지 못한다.
  useEffect(() => {
    fetchRole().then(setUser);
  }, [setUser]);

  return (
    <>
      {/* 이 그룹은 레이아웃이 헤더를 그리지 않으므로 페이지가 직접 얹는다. */}
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center gap-28 p-20">
          {/* 원형 배경과 체크 표시가 아이콘 하나에 함께 들어 있다. */}
          <CheckRoundIcon className="size-[7.2rem]" />

          <div className="flex w-full flex-col items-center gap-8 text-center">
            <h1 className="text-t2-bold text-fg-neutral-solid">{title}</h1>
            <p className="text-b1-reading-medium text-fg-neutral-primary">
              {description}
            </p>
          </div>
        </div>

        <BottomButton label="확인" onClick={() => router.replace(homePath)} />
      </main>
    </>
  );
}
