"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deleteLive, getSellerLiveTab } from "@/app/live/_lib/live-api";
import { describeLiveError } from "@/app/live/_lib/live-error";
import { SellerNav } from "@/components/navigations/SellerNav";
import type { SellerScheduledLive } from "@/types/live";

import { DeleteLiveModal } from "./DeleteLiveModal";
import { LiveNowCard } from "./LiveNowCard";
import { LiveStatCard } from "./LiveStatCard";
import { ManageLiveSheet } from "./ManageLiveSheet";
import { StartLiveSheet } from "./StartLiveSheet";
import { UpcomingLiveSection } from "./UpcomingLiveSection";

export function SellerLiveTab() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 관리 시트와 삭제 모달은 어느 라이브를 고른 건지 함께 들고 있어야 한다.
  const [managing, setManaging] = useState<SellerScheduledLive | null>(null);
  const [deleting, setDeleting] = useState<SellerScheduledLive | null>(null);
  const [starting, setStarting] = useState<SellerScheduledLive | null>(null);

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

  const remove = useMutation({
    mutationFn: (live: SellerScheduledLive) => deleteLive(live.liveId),
    onSuccess: () => {
      setDeleting(null);
      queryClient.invalidateQueries({ queryKey: ["seller-live-tab"] });
    },
  });

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
              onStart={setStarting}
              onMore={setManaging}
            />
          </>
        )}
      </div>

      <SellerNav />

      <StartLiveSheet
        open={starting !== null}
        title={starting?.title ?? ""}
        onClose={() => setStarting(null)}
        onStart={() => {
          if (starting) goStudio(starting);
        }}
      />

      <ManageLiveSheet
        open={managing !== null}
        onClose={() => setManaging(null)}
        onEdit={() => {
          if (managing) goEdit(managing.publicId);
        }}
        onDelete={() => {
          remove.reset();
          setDeleting(managing);
          setManaging(null);
        }}
      />

      {deleting && (
        <DeleteLiveModal
          deleting={remove.isPending}
          error={remove.error ? describeLiveError(remove.error).message : null}
          onDelete={() => remove.mutate(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
