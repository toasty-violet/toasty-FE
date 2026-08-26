"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { BroadcastPanel } from "./BroadcastPanel";
import { describeLiveError } from "@/app/live/_lib/live-error";
import { getLive, getLiveStreamStatus } from "@/app/live/_lib/live-api";

export function BroadcastStudio({ publicId }: { publicId: string }) {
  const live = useQuery({
    queryKey: ["live", publicId],
    queryFn: () => getLive(publicId),
  });

  // 셀러 전용 API 라 진입 권한 확인을 겸한다. 남의 라이브면 서버가 403 을 준다.
  // liveId 는 공개 조회 응답에서만 나오므로 그 뒤에 부른다.
  const streamStatus = useQuery({
    queryKey: ["live-stream-status", live.data?.liveId],
    queryFn: () => getLiveStreamStatus(live.data!.liveId),
    enabled: live.data !== undefined,
  });

  if (live.isPending || streamStatus.isPending) {
    return <p className="p-5 text-sm text-zinc-500">불러오는 중…</p>;
  }

  // 폴링이 일시적으로 실패해도 방송 중 화면이 사라지지 않도록, 데이터가 없을 때만 막는다.
  const fatal =
    (live.error && !live.data) || (streamStatus.error && !streamStatus.data);
  if (fatal) {
    return (
      <p role="alert" className="p-5 text-sm text-red-600 dark:text-red-400">
        {describeLiveError(live.error ?? streamStatus.error).message}
      </p>
    );
  }

  if (streamStatus.data?.status === "ENDED") {
    return (
      <div className="flex flex-col gap-3 p-5">
        <p className="text-sm">이미 종료된 방송입니다.</p>
        <Link
          href={`/live/${publicId}`}
          className="text-sm underline underline-offset-4"
        >
          시청 화면 열기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <BroadcastPanel live={live.data!} />
      <Link
        href={`/live/${publicId}`}
        className="px-5 pb-5 text-sm underline underline-offset-4"
      >
        시청 화면 열기
      </Link>
    </div>
  );
}
