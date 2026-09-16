"use client";

import { useRouter } from "next/navigation";

import CheckRoundIcon from "@/assets/CheckRound.svg";
import { Button } from "@/components/buttons/Button";

export function OrderCompleteScreen({ shopPath }: { shopPath: string }) {
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-28 p-20">
        {/* 원형 배경과 체크 표시가 아이콘 하나에 함께 들어 있다. */}
        <CheckRoundIcon className="size-[7.2rem]" />

        <div className="flex w-full flex-col items-center gap-8 text-center">
          <h1 className="text-t2-bold text-fg-neutral-solid">
            주문을 완료했어요!
          </h1>
          <p className="text-b1-reading-medium text-fg-neutral-primary">
            상품이 발송되면 카카오톡으로
            <br />
            알림을 보내드려요.
          </p>
        </div>
      </div>

      {/* BottomButton 은 버튼 한 개짜리라, 같은 여백만 맞춰 두 개를 나란히 둔다. */}
      <div className="flex h-fit w-full gap-10 px-20 pt-10 pb-20">
        {/* Button 의 fullWidth 는 w-full 이라 그대로 두면 한 줄에 못 들어간다. */}
        <div className="min-w-0 flex-1">
          <Button
            label="쇼핑 계속하기"
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={() => router.replace(shopPath)}
          />
        </div>
        <div className="min-w-0 flex-1">
          <Button
            label="주문 상세보기"
            fullWidth
            onClick={() => router.replace("/orders")}
          />
        </div>
      </div>
    </main>
  );
}
