"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { getSellerLiveTab } from "@/app/live/_lib/live-api";
import { SellerNav } from "@/components/navigations/SellerNav";
import type { SellerScheduledLive } from "@/types/live";

import { LiveNowCard } from "./LiveNowCard";
import { LiveStatCard } from "./LiveStatCard";
import { UpcomingLiveSection } from "./UpcomingLiveSection";

export function SellerLiveTab() {
  const router = useRouter();

  const { data, isPending, error } = useQuery({
    queryKey: ["seller-live-tab"],
    queryFn: getSellerLiveTab,
  });

  const copyLink = (publicId: string) => {
    void navigator.clipboard?.writeText(
      `${window.location.origin}/live/${publicId}`,
    );
  };

  const goStudio = (live: SellerScheduledLive) =>
    router.push(`/shop/lives/${live.publicId}/studio`);

  const goEdit = (publicId: string) =>
    router.push(`/shop/lives/${publicId}/edit`);

  const broadcasting = data?.broadcasting;

  return (
    <div className="bg-bg-neutral-weak flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-28 overflow-y-auto px-20 pt-20 pb-56">
        {isPending && (
          <p className="text-l5-medium text-fg-neutral-secondary">
            불러오는 중…
          </p>
        )}

        {error && (
          <p role="alert" className="text-l5-medium text-fg-critical">
            라이브 정보를 불러오지 못했습니다.
          </p>
        )}

        {data && (
          <>
            {/* 방송 중이 아니면 카드를 통째로 숨긴다. */}
            {broadcasting && (
              <LiveNowCard
                live={broadcasting}
                onWatch={() => router.push(`/live/${broadcasting.publicId}`)}
                onCopyLink={() => copyLink(broadcasting.publicId)}
                onEdit={() => goEdit(broadcasting.publicId)}
              />
            )}

            {/* 값이 없어도 섹션은 남기고 "-" 로 둔다. */}
            <LiveStatCard stat={data.latestStat} />

            <UpcomingLiveSection
              lives={data.scheduled}
              onCreate={() => router.push("/shop/lives/new")}
              onCopyLink={(live) => copyLink(live.publicId)}
              onStart={goStudio}
              onMore={(live) => goEdit(live.publicId)}
            />
          </>
        )}
      </div>

      <SellerNav />
    </div>
  );
}
