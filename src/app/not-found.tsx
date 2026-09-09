import Link from "next/link";

import AlertRoundIcon from "@/assets/AlertRound.svg";

// 존재하지 않는 경로로 들어왔을 때 보여 주는 화면
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-28 p-20">
        {/* 원형 배경과 느낌표가 아이콘 하나에 함께 들어 있다. */}
        <AlertRoundIcon className="size-[7.2rem]" />

        <div className="flex w-full flex-col items-center gap-8 text-center">
          <h1 className="text-t2-bold text-fg-neutral-solid">
            페이지를 찾을 수 없어요
          </h1>
          <p className="text-b1-reading-medium text-fg-neutral-primary">
            요청하신 페이지가 존재하지 않거나
            <br />
            주소가 변경되었을 수 있습니다.
          </p>
        </div>
      </div>

      <div className="flex h-fit w-full flex-col gap-12 px-20 pt-10 pb-20">
        <Link
          href="/"
          className="text-l1-semibold bg-bg-neutral-strong text-fg-neutral-inverted rounded-12 flex h-[5.6rem] w-full items-center justify-center gap-6 px-24 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
