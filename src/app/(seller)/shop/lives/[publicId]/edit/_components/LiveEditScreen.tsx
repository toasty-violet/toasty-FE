"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getLive, getLiveDetail } from "@/app/live/_lib/live-api";
import { LiveForm } from "../../../_components/LiveForm";

export function LiveEditScreen({ publicId }: { publicId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 주소에는 publicId 만 있고 수정 API 는 liveId 를 받으므로 공개 조회로 번호를 먼저 얻는다.
  const live = useQuery({
    queryKey: ["live", publicId],
    queryFn: () => getLive(publicId),
  });

  const detail = useQuery({
    queryKey: ["live-detail", live.data?.liveId],
    queryFn: () => getLiveDetail(live.data!.liveId),
    enabled: live.data !== undefined,
  });

  if (live.error || detail.error) {
    return (
      <p role="alert" className="text-l5-medium text-fg-critical p-20">
        라이브 정보를 불러오지 못했습니다.
      </p>
    );
  }

  if (!detail.data) {
    return (
      <p className="text-l5-medium text-fg-neutral-secondary p-20">
        불러오는 중…
      </p>
    );
  }

  return (
    <LiveForm
      mode={{
        type: "edit",
        live: detail.data.live,
        products: detail.data.products,
      }}
      onSaved={() => {
        // 제목·상품 수가 목록에도 보이므로 라이브탭을 다시 받게 한다.
        queryClient.invalidateQueries({ queryKey: ["seller-live-tab"] });
        queryClient.invalidateQueries({ queryKey: ["live", publicId] });
        router.push("/shop/lives");
      }}
    />
  );
}
