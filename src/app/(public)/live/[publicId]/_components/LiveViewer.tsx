"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import AlertRoundIcon from "@/assets/AlertRound.svg";
import CloseIcon from "@/assets/Close.svg";
import SoundOffIcon from "@/assets/SoundOff.svg";
import SoundOnIcon from "@/assets/SoundOn.svg";
import { Button } from "@/components/buttons/Button";
import { LiveChatInput } from "@/app/live/_components/LiveChatInput";
import { LiveChatOverlay } from "@/app/live/_components/LiveChatOverlay";
import { LiveHeader, viewerLabel } from "@/app/live/_components/LiveHeader";
import { LiveNotice } from "@/app/live/_components/LiveNotice";
import {
  getLive,
  getLivePlayback,
  getPublicLiveProducts,
  getViewerCount,
} from "@/app/live/_lib/live-api";
import { useLiveChat } from "@/app/live/_lib/use-live-chat";
import { usePurchase } from "@/app/live/_lib/use-purchase";
import { PaymentConfirmSheet } from "@/components/overlays/PaymentConfirmSheet";
import { PaymentDoneModal } from "@/components/overlays/PaymentDoneModal";
import { ApiRequestError } from "@/lib/api-error";
import { useAuthStore } from "@/store/auth-store";
import { LIVE_ERROR_CODE, type LiveProduct } from "@/types/live";

import { LivePlayer } from "./LivePlayer";
import { ViewerProductBar } from "./ViewerProductBar";
import { ViewerProductsSheet } from "./ViewerProductsSheet";

const POLL_MS = 4000;

// 안내가 스스로 사라지는 시간.
const GUEST_TOAST_MS = 3000;

/** 비로그인이 구매를 누른 그때만 뜬다. 눌러 바로 로그인으로 간다. */
function GuestToast({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-bg-neutral-solid text-l5-medium text-fg-neutral-inverted absolute inset-x-0 top-1/2 mx-auto flex w-fit -translate-y-1/2 items-center gap-8 rounded-full px-16 py-8"
    >
      <AlertRoundIcon className="size-18 shrink-0 [&_path]:fill-current" />
      로그인 후 상품 구매가 가능해요.
    </button>
  );
}

export function LiveViewer({ publicId }: { publicId: string }) {
  const router = useRouter();
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  // 소리가 있는 자동재생은 브라우저가 막는다. 음소거로 시작하고 눌러서 켠다.
  const [muted, setMuted] = useState(true);
  const [productsOpen, setProductsOpen] = useState(false);

  // 비로그인은 구매를 막고 로그인으로 안내한다. 시청 자체는 막지 않는다.
  const authStatus = useAuthStore((state) => state.status);
  const isGuest = authStatus === "guest";
  const goLogin = () => router.push("/login");

  // 안내는 구매를 눌렀을 때만 띄운다. 계속 떠 있으면 채팅을 가린다.
  const [guestToast, setGuestToast] = useState(false);
  useEffect(() => {
    if (!guestToast) return;

    const hide = window.setTimeout(() => setGuestToast(false), GUEST_TOAST_MS);
    return () => window.clearTimeout(hide);
  }, [guestToast]);

  /** 비로그인이면 사지 못하므로 안내만 띄운다. */
  const buy = (product: LiveProduct) => {
    if (isGuest) {
      setGuestToast(true);
      return;
    }
    purchase.buy(product);
  };

  // 결제창은 이 화면을 떠났다 successUrl 로 돌아온다. 승인은 그때 이어진다.
  const purchase = usePurchase({ returnPath: `/live/${publicId}` });
  // 비로그인도 눌러야 안내가 뜬다. 로그인 여부가 확정되기 전에만 잠근다.
  const buyDisabled = authStatus === "loading" || purchase.pending;

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

  // 채팅 자리는 방송 중에만 있으므로 그때만 방에 붙는다.
  const chat = useLiveChat({ publicId, enabled: broadcasting });

  if (isPending) return <LiveNotice>불러오는 중…</LiveNotice>;

  if (error) {
    const notFound =
      error instanceof ApiRequestError &&
      error.code === LIVE_ERROR_CODE.NOT_FOUND;
    return (
      <LiveNotice alert>
        {notFound
          ? "라이브를 찾을 수 없습니다."
          : "라이브를 불러오지 못했습니다."}
      </LiveNotice>
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
            muted={muted}
            onPlaybackError={setPlaybackError}
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
              {/* 소리는 음소거로 시작한다. 켜는 것은 사용자가 눌러야 브라우저가 허락한다. */}
              <button
                type="button"
                aria-label={muted ? "소리 켜기" : "소리 끄기"}
                onClick={() => setMuted((on) => !on)}
                className="text-fg-neutral-inverted shrink-0"
              >
                {muted ? (
                  <SoundOffIcon className="size-24 [&_path]:fill-current" />
                ) : (
                  <SoundOnIcon className="size-24 [&_path]:fill-current" />
                )}
              </button>
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

        {/* 방송 중이 아니면 살 수 없으므로 상품 영역을 두지 않는다. */}
        {broadcasting && (
          <div className="flex w-full flex-col gap-12 bg-gradient-to-b from-transparent to-[#1a1c2099] to-40% px-20 pt-48 pb-20">
            {!chat.unavailable && <LiveChatOverlay messages={chat.messages} />}

            {purchase.message && (
              <p
                role="alert"
                className="text-l5-medium text-fg-neutral-inverted text-center"
              >
                {purchase.message}
              </p>
            )}

            <ViewerProductBar
              pinned={pinned}
              totalCount={list.length}
              buyDisabled={buyDisabled}
              onOpenAllProducts={() => setProductsOpen(true)}
              onBuy={() => pinned && buy(pinned)}
            />

            {/* 채팅방이 없는 라이브는 붙을 곳이 없어 입력줄을 두지 않는다. */}
            {!chat.unavailable && (
              // 안내는 입력줄 위에 얹혀 자리를 차지하지 않는다.
              <div className="relative w-full">
                <LiveChatInput disabled={!chat.writable} onSend={chat.send} />
                {guestToast && <GuestToast onClick={goLogin} />}
              </div>
            )}

            {/* 입력줄이 없으면 안내만 제 줄로 띄운다. */}
            {chat.unavailable && guestToast && (
              <div className="relative h-[4.4rem] w-full">
                <GuestToast onClick={goLogin} />
              </div>
            )}
          </div>
        )}
      </div>

      <ViewerProductsSheet
        open={productsOpen}
        products={list}
        pinnedProductId={products?.currentPinnedProductId ?? null}
        buyDisabled={buyDisabled}
        onClose={() => setProductsOpen(false)}
        onBuy={(product) => {
          // 확인 시트가 상품 시트 위로 겹치지 않게 먼저 닫는다.
          setProductsOpen(false);
          buy(product);
        }}
      />

      {purchase.confirming && (
        <PaymentConfirmSheet
          open
          price={purchase.confirming.price}
          pending={purchase.pending}
          onClose={purchase.closeConfirm}
          onConfirm={purchase.confirmBuy}
        />
      )}

      <PaymentDoneModal open={purchase.done} onClose={purchase.closeDone} />
    </div>
  );
}
