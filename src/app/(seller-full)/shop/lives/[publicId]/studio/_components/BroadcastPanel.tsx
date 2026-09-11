"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AmazonIVSBroadcastClient } from "amazon-ivs-web-broadcast";
import {
  endLive,
  getLiveProducts,
  getLiveStreamStatus,
  getViewerCount,
  pinLiveProduct,
  reissueBroadcastCredential,
  updateLiveProduct,
} from "@/app/live/_lib/live-api";
import { describeLiveError } from "@/app/live/_lib/live-error";
import { useLiveChat } from "@/app/live/_lib/use-live-chat";
import type {
  BroadcastCredential,
  LiveProduct,
  LiveViewer,
} from "@/types/live";

import { LiveChatInput } from "@/app/live/_components/LiveChatInput";
import { LiveChatOverlay } from "@/app/live/_components/LiveChatOverlay";
import { LiveHeader, viewerLabel } from "@/app/live/_components/LiveHeader";
import { ConfirmModal } from "@/components/overlays/ConfirmModal";

import { AllProductsSheet } from "./AllProductsSheet";
import { LiveProductBar } from "./LiveProductBar";
import { ProductEditSheet } from "./ProductEditSheet";
import { LiveNotice } from "@/app/live/_components/LiveNotice";

// 체크 시트에서 확인받고 들어오므로 준비와 연결은 지나가는 단계다.
type Status = "preparing" | "starting" | "live" | "ended" | "unavailable";

const STREAM_STATUS_POLL_MS = 4000;

export function BroadcastPanel({
  live,
  onLeave,
}: {
  live: LiveViewer;
  onLeave: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clientRef = useRef<AmazonIVSBroadcastClient | null>(null);
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>("preparing");
  const [allProductsOpen, setAllProductsOpen] = useState(false);
  const [editing, setEditing] = useState<LiveProduct | undefined>();
  const [askingEnd, setAskingEnd] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let client: AmazonIVSBroadcastClient | undefined;
    const streams: MediaStream[] = [];

    const releaseStreams = () =>
      streams.forEach((stream) =>
        stream.getTracks().forEach((track) => track.stop()),
      );

    // 준비가 끝나면 바로 이어서 부른다. 디자인에 송출 시작 버튼이 없다.
    async function startBroadcast(client: AmazonIVSBroadcastClient) {
      setStatus("starting");
      setMessage(null);

      let fresh: BroadcastCredential;
      try {
        fresh = await reissueBroadcastCredential(live.liveId);
      } catch (error: unknown) {
        setStatus("unavailable");
        setMessage(describeLiveError(error).message);
        return;
      }

      // 실패를 reject 대신 resolve 로 돌려주는 경우가 있어 반환값도 확인한다.
      const failure = await client
        .startBroadcast(fresh.streamKey, fresh.ingestEndpoint)
        .catch((error: unknown) => error);

      if (failure instanceof Error) {
        setStatus("unavailable");
        setMessage(`송출을 시작하지 못했습니다. ${failure.message}`);
        return;
      }
      setStatus("live");
    }

    async function setup() {
      const IVSBroadcastClient = (await import("amazon-ivs-web-broadcast"))
        .default;
      if (cancelled) return;

      if (!IVSBroadcastClient.isSupported()) {
        setStatus("unavailable");
        setMessage("이 브라우저는 송출을 지원하지 않습니다.");
        return;
      }

      // 카메라와 마이크는 따로 요청한다. SDK가 각각을 별도 입력으로 받는다.
      // 얻는 즉시 streams 에 넣어야 중간에 정리가 지나가도 트랙을 놓치지 않는다.
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 720 }, height: { ideal: 1280 } },
      });
      streams.push(videoStream);
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streams.push(audioStream);

      if (cancelled) {
        releaseStreams();
        return;
      }

      client = IVSBroadcastClient.create({
        streamConfig: IVSBroadcastClient.BASIC_PORTRAIT,
      });

      if (canvasRef.current) {
        client.attachPreview(canvasRef.current);
      }
      await client.addVideoInputDevice(videoStream, "camera", { index: 0 });
      await client.addAudioInputDevice(audioStream, "mic");

      client.emitter.on(
        IVSBroadcastClient.BroadcastClientEvents.ERROR,
        (error) => setMessage(error.message),
      );

      if (cancelled) {
        client.delete();
        releaseStreams();
        return;
      }

      clientRef.current = client;
      await startBroadcast(client);
    }

    setup().catch((error: unknown) => {
      if (cancelled) return;
      setStatus("unavailable");
      setMessage(
        error instanceof Error
          ? `카메라·마이크를 켜지 못했습니다. ${error.message}`
          : "카메라·마이크를 켜지 못했습니다.",
      );
    });

    return () => {
      cancelled = true;
      clientRef.current = null;
      client?.detachPreview();
      client?.delete();
      releaseStreams();
    };
  }, [live.liveId]);

  const { data: streamStatus } = useQuery({
    queryKey: ["live-stream-status", live.liveId],
    queryFn: () => getLiveStreamStatus(live.liveId),
    enabled: status === "live",
    refetchInterval: STREAM_STATUS_POLL_MS,
  });

  // 시청자 수는 계속 바뀌므로 송출 상태와 같은 주기로 다시 받는다.
  const { data: viewerCount } = useQuery({
    queryKey: ["live-viewer-count", live.publicId],
    queryFn: () => getViewerCount(live.publicId),
    enabled: status === "live",
    refetchInterval: STREAM_STATUS_POLL_MS,
  });

  // 재고를 줄이는 건 셀러가 아니라 시청자의 구매라, 상태도 함께 다시 받아야 한다.
  const products = useQuery({
    queryKey: ["live-products", live.liveId],
    queryFn: () => getLiveProducts(live.liveId),
    enabled: status === "live",
    refetchInterval: STREAM_STATUS_POLL_MS,
  });

  // 채팅 자리는 방송 중에만 있으므로 그때만 방에 붙는다.
  const chat = useLiveChat({
    publicId: live.publicId,
    enabled: status === "live",
  });

  const list = products.data?.products ?? [];
  const pinnedId = products.data?.currentPinnedProductId ?? null;
  const pinnedIndex = list.findIndex((item) => item.productId === pinnedId);
  const pinned = pinnedIndex >= 0 ? list[pinnedIndex] : undefined;

  const pin = useMutation({
    mutationFn: (productId: number) => pinLiveProduct(live.liveId, productId),
    onSuccess: () => products.refetch(),
  });

  const edit = useMutation({
    mutationFn: ({
      productId,
      ...values
    }: {
      productId: number;
      price: number;
      stockQuantity: number;
    }) => updateLiveProduct(live.liveId, productId, values),
    onSuccess: async () => {
      await products.refetch();
      setEditing(undefined);
    },
  });

  const openEdit = (product: LiveProduct) => {
    edit.reset();
    setEditing(product);
  };

  // 노출 순서대로 다음 상품을 고정한다. 마지막이면 처음으로 돌아간다.
  const pinNext = () => {
    if (list.length === 0) return;
    pin.mutate(list[(pinnedIndex + 1) % list.length].productId);
  };

  const endMutation = useMutation({
    mutationFn: () => endLive(live.liveId),
    onSuccess: () => {
      clientRef.current?.stopBroadcast();
      setStatus("ended");
      setAskingEnd(false);
      // 끝난 라이브는 라이브탭에서 빠진다. 버리지 않으면 돌아간 화면이
      // 종료 전에 받아둔 목록을 staleTime 동안 그대로 다시 그린다.
      queryClient.invalidateQueries({ queryKey: ["seller-live-tab"] });
      onLeave();
    },
    // 실패 사유는 모달 뒤 화면에 남는다. 모달을 닫아야 보인다.
    onError: () => setAskingEnd(false),
  });

  useEffect(() => {
    if (status !== "live") return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [status]);

  const connecting = status === "preparing" || status === "starting";

  // 카메라·마이크를 못 켜면 송출을 시작할 수 없어 화면에 머물 이유가 없다.
  if (status === "unavailable") {
    return (
      <LiveNotice alert onBack={onLeave}>
        {message ?? "카메라·마이크를 켜지 못했습니다."}
      </LiveNotice>
    );
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-black">
      {/* 카메라 화면이 배경이고, 상단 바와 하단 영역이 그 위에 얹힌다. */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full object-cover"
      />

      <div className="relative flex flex-1 flex-col">
        <LiveHeader
          title={live.title}
          shopImageUrl={live.seller.shopImageUrl}
          subtitle={
            <>
              <span className="text-l6-medium">{viewerLabel(viewerCount)}</span>
              <span className="text-l7-medium">∙</span>
              {/* 판매율은 주문 집계가 생기면 서버가 준다. */}
              <span className="text-l7-medium">판매율 -%</span>
            </>
          }
          action={
            <button
              type="button"
              onClick={() => {
                endMutation.reset();
                setAskingEnd(true);
              }}
              disabled={endMutation.isPending}
              className="rounded-8 text-l5-semibold bg-bg-neutral-solid text-fg-neutral-inverted flex h-32 shrink-0 items-center justify-center px-12 disabled:opacity-60"
            >
              {endMutation.isPending ? "종료 중…" : "방송종료"}
            </button>
          }
        />

        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-20">
          {connecting && (
            <p className="text-l4-semibold text-fg-neutral-inverted">
              {status === "preparing"
                ? "카메라를 준비하는 중…"
                : "연결하는 중…"}
            </p>
          )}
          {status === "ended" && (
            <p className="text-l4-semibold text-fg-neutral-inverted">
              방송이 종료되었습니다.
            </p>
          )}
          {status === "live" && !streamStatus?.broadcasting && (
            <p className="text-l5-medium text-fg-neutral-inverted opacity-70">
              서버가 영상을 받는 중입니다…
            </p>
          )}
          {(message || endMutation.error) && (
            <p
              role="alert"
              className="rounded-8 text-l5-medium bg-bg-critical-solid text-fg-neutral-inverted px-12 py-8 text-center"
            >
              {message ?? describeLiveError(endMutation.error).message}
            </p>
          )}
        </div>

        {status === "live" && (
          <div className="flex w-full flex-col gap-12 bg-gradient-to-b from-transparent to-[#1a1c2099] to-40% px-20 pt-48 pb-20">
            {!chat.unavailable && <LiveChatOverlay messages={chat.messages} />}

            <LiveProductBar
              pinned={pinned}
              totalCount={list.length}
              pinning={pin.isPending}
              onOpenAllProducts={() => setAllProductsOpen(true)}
              onEditPinned={() => pinned && openEdit(pinned)}
              onPinNext={pinNext}
            />

            {!chat.unavailable && (
              <LiveChatInput disabled={!chat.writable} onSend={chat.send} />
            )}
          </div>
        )}
      </div>

      <AllProductsSheet
        open={allProductsOpen}
        products={list}
        pinnedProductId={pinnedId}
        onClose={() => setAllProductsOpen(false)}
        onEdit={(product) => {
          setAllProductsOpen(false);
          openEdit(product);
        }}
        onPin={(product) => {
          pin.mutate(product.productId);
          setAllProductsOpen(false);
        }}
      />

      <ConfirmModal
        open={askingEnd}
        title="방송을 종료할까요?"
        description="라이브에서 판매되지 않은 상품은 종료 후 일반 판매 상품으로 자동 전환돼요."
        confirmLabel={endMutation.isPending ? "종료하는 중…" : "종료"}
        confirming={endMutation.isPending}
        onConfirm={() => endMutation.mutate()}
        onClose={() => {
          if (!endMutation.isPending) setAskingEnd(false);
        }}
      />

      <ProductEditSheet
        product={editing}
        saving={edit.isPending}
        error={edit.error ? describeLiveError(edit.error).message : null}
        onSave={(values) =>
          editing && edit.mutate({ productId: editing.productId, ...values })
        }
        onClose={() => {
          if (!edit.isPending) setEditing(undefined);
        }}
      />
    </div>
  );
}
