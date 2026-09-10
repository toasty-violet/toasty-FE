"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { BroadcastPanel } from "./BroadcastPanel";
import { StudioNotice } from "./StudioNotice";
import { describeLiveError } from "@/app/live/_lib/live-error";
import { getLive, getLiveStreamStatus } from "@/app/live/_lib/live-api";

export function BroadcastStudio({ publicId }: { publicId: string }) {
  const router = useRouter();
  const live = useQuery({
    queryKey: ["live", publicId],
    queryFn: () => getLive(publicId),
  });

  // 셀러 전용 API 라 진입 권한 확인을 겸한다. 남의 라이브면 서버가 403 을 준다.
  // liveId 는 공개 조회 응답에서만 나오므로 그 뒤에 부른다.
  // BroadcastPanel 의 폴링과 키를 나눈다. 캐시를 공유하면 폴링이 받아온 ENDED 가
  // 이쪽에 흘러들어 방송 중에 Panel 이 사라진다. 권한 확인이라 캐시도 타지 않는다.
  const streamStatus = useQuery({
    queryKey: ["live-stream-status", live.data?.liveId, "entry"],
    queryFn: () => getLiveStreamStatus(live.data!.liveId),
    enabled: live.data !== undefined,
    staleTime: 0,
  });

  if (live.isPending || streamStatus.isPending) {
    return <StudioNotice>불러오는 중…</StudioNotice>;
  }

  // 폴링이 일시적으로 실패해도 방송 중 화면이 사라지지 않도록, 데이터가 없을 때만 막는다.
  const fatal =
    (live.error && !live.data) || (streamStatus.error && !streamStatus.data);
  if (fatal) {
    return (
      <StudioNotice alert onBack={() => router.replace("/shop/lives")}>
        {describeLiveError(live.error ?? streamStatus.error).message}
      </StudioNotice>
    );
  }

  if (streamStatus.data?.status === "ENDED") {
    return (
      <StudioNotice onBack={() => router.replace("/shop/lives")}>
        이미 종료된 방송입니다.
      </StudioNotice>
    );
  }

  return (
    <BroadcastPanel
      live={live.data!}
      onLeave={() => router.replace("/shop/lives")}
    />
  );
}
