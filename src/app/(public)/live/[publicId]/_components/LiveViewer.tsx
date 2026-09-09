"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import AlertRoundIcon from "@/assets/AlertRound.svg";
import CloseIcon from "@/assets/Close.svg";
import { Button } from "@/components/buttons/Button";
import { LiveHeader, viewerLabel } from "@/app/live/_components/LiveHeader";
import {
  getLive,
  getLivePlayback,
  getPublicLiveProducts,
  getViewerCount,
} from "@/app/live/_lib/live-api";
import { ApiRequestError } from "@/lib/api-error";
import { useAuthStore } from "@/store/auth-store";
import { LIVE_ERROR_CODE } from "@/types/live";

import { LivePlayer } from "./LivePlayer";
import { ViewerProductBar } from "./ViewerProductBar";
import { ViewerProductsSheet } from "./ViewerProductsSheet";

const POLL_MS = 4000;

/** 방송 화면 대신 띄우는 안내. 배경이 검정이라 글자를 밝게 둔다. */
function Notice({
  children,
  alert = false,
}: {
  children: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <div className="flex flex-1 items-center justify-center bg-black px-20">
      <p
        role={alert ? "alert" : undefined}
        className="text-l4-semibold text-fg-neutral-inverted text-center"
      >
        {children}
      </p>
    </div>
  );
}

export function LiveViewer({ publicId }: { publicId: string }) {
  const router = useRouter();
  const [playbackError, setPlaybackError] = useState("");
  const [productsOpen, setProductsOpen] = useState(false);

  // 비로그인은 구매를 막고 로그인으로 안내한다. 시청 자체는 막지 않는다.
  const isGuest = useAuthStore((state) => state.status) === "guest";
  const goLogin = () => router.push("/login");

  const {
    data: live,
    isPending,
    error,
  } = useQuery({
    queryKey: ["live", publicId],
    queryFn: () => getLive(publicId),
  });

  const { data: playback } = useQuery({
    queryKey: ["live-playback", publicId],
    queryFn: () => getLivePlayback(publicId),
    refetchInterval: (query) =>
      query.state.data?.status === "ENDED" ? false : POLL_MS,
  });

  const broadcasting = playback?.status === "LIVE";

  // 시청자 수와 편성 상품은 방송 중일 때만 계속 다시 받는다.
  const { data: viewerCount } = useQuery({
    queryKey: ["live-viewer-count", publicId],
    queryFn: () => getViewerCount(publicId),
    enabled: broadcasting,
    refetchInterval: POLL_MS,
  });

  const { data: products } = useQuery({
    queryKey: ["live-public-products", publicId],
    queryFn: () => getPublicLiveProducts(publicId),
    enabled: live !== undefined,
    refetchInterval: broadcasting ? POLL_MS : false,
  });

  if (isPending) return <Notice>불러오는 중…</Notice>;

  if (error) {
    const notFound =
      error instanceof ApiRequestError &&
      error.code === LIVE_ERROR_CODE.NOT_FOUND;
    return (
      <Notice alert>
        {notFound
          ? "라이브를 찾을 수 없습니다."
          : "라이브를 불러오지 못했습니다."}
      </Notice>
    );
  }

  const list = products?.products ?? [];
  const pinned = list.find(
    (item) => item.productId === products?.currentPinnedProductId,
  );

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-black">
      {broadcasting && (
        <div className="absolute inset-0">
          <LivePlayer
            playbackUrl={playback.playbackUrl}
            onError={setPlaybackError}
          />
        </div>
      )}

      <div className="relative flex flex-1 flex-col">
        <LiveHeader
          title={live.title}
          shopImageUrl={live.seller.shopImageUrl}
          subtitle={
            <>
              <span className="text-l6-medium truncate">
                {live.seller.shopName}
              </span>
              <span className="text-l7-medium">∙</span>
              <span className="text-l6-medium shrink-0">
                {viewerLabel(broadcasting ? viewerCount : 0)}
              </span>
            </>
          }
          action={
            <div className="flex shrink-0 items-center gap-12">
              {isGuest && <Button label="로그인" size="xs" onClick={goLogin} />}
              <button
                type="button"
                aria-label="닫기"
                onClick={() => router.back()}
                className="text-fg-neutral-inverted shrink-0"
              >
                <CloseIcon className="size-24 [&_path]:fill-current" />
              </button>
            </div>
          }
        />

        <div className="flex flex-1 flex-col items-center justify-center px-20">
          {!broadcasting && (
            <p className="text-l4-semibold text-fg-neutral-inverted text-center">
              {playback?.status === "ENDED"
                ? "방송이 종료되었습니다."
                : "아직 방송이 시작되지 않았습니다."}
            </p>
          )}
          {broadcasting && playbackError && (
            <p
              role="alert"
              className="text-l5-medium text-fg-neutral-inverted text-center opacity-70"
            >
              {playbackError}
            </p>
          )}
        </div>

        {/* 채팅 오버레이와 입력창은 BE 가 준비되면 이 영역에 함께 들어간다. */}
        <div className="flex w-full flex-col gap-12 bg-gradient-to-b from-transparent to-[#1a1c2099] to-40% px-20 pt-48 pb-20">
          <ViewerProductBar
            pinned={pinned}
            totalCount={list.length}
            buyDisabled={isGuest}
            onOpenAllProducts={() => setProductsOpen(true)}
            onBuy={() => {}}
          />

          {isGuest && (
            <p className="bg-bg-neutral-solid text-l5-medium text-fg-neutral-inverted mx-auto flex items-center gap-8 rounded-full px-16 py-8">
              <AlertRoundIcon className="size-18 shrink-0 [&_path]:fill-current" />
              로그인 후 상품 구매가 가능해요.
            </p>
          )}
        </div>
      </div>

      <ViewerProductsSheet
        open={productsOpen}
        products={list}
        pinnedProductId={products?.currentPinnedProductId ?? null}
        buyDisabled={isGuest}
        onClose={() => setProductsOpen(false)}
        onBuy={() => {}}
      />
    </div>
  );
}
