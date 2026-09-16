"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { ApiRequestError } from "@/lib/api-error";
import { confirmOrderPayment, createOrder } from "@/lib/payment";
import {
  loadPoint3Widgets,
  requestPoint3Payment,
  resolvePoint3FailMessage,
} from "@/lib/point3";

import {
  clearPendingOrderId,
  loadPendingOrderId,
  savePendingOrderId,
} from "./pending-order";

/** 결제 확인 시트와 주문 생성에 필요한 최소 정보. */
type Product = { productId: number; name: string; price: number };

// 승인 결과를 확인하지 못한 경우. 결제가 실패한 것은 아니다.
const UNCONFIRMED_STATUS = 503;
const CONFIRM_RETRIES = 2;
const CONFIRM_RETRY_MS = 2000;

function isUnconfirmed(error: unknown) {
  return (
    error instanceof ApiRequestError && error.status === UNCONFIRMED_STATUS
  );
}

/**
 * 상품 하나를 사는 흐름 전체.
 *
 * 확인 시트로 금액을 알린 뒤 주문을 만들어 결제 세션을 받고 결제창을 띄운다.
 * 결제창은 returnPath 로 돌아오므로 그때 쿼리를 보고 승인 요청을 이어 보낸다.
 *
 * onConfirmed 를 넘기면 승인을 마쳤을 때 done 대신 그것을 부른다.
 * 결제 화면처럼 완료 창이 아니라 다른 화면으로 넘어가는 경우에 쓴다.
 */
export function usePurchase({
  returnPath,
  liveId,
  onConfirmed,
}: {
  returnPath: string;
  /** 라이브를 보다 산 경우에만. 셀러 라이브탭의 방송별 판매 집계에 쓰인다. */
  liveId?: number;
  onConfirmed?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  // 결제창을 열기 전에 금액을 확인시킨다. 확인을 누른 상품만 결제로 넘어간다.
  const [confirming, setConfirming] = useState<Product | null>(null);

  // 결제 실패로 돌아온 경우 point3 가 code 를 실어 보낸다.
  const failMessage = resolvePoint3FailMessage(searchParams.get("code"));
  // 결제 성공으로 돌아온 경우에만 orderId(=sessionId)가 붙는다.
  const paidSessionId = searchParams.get("orderId");

  const confirm = useMutation({
    mutationFn: confirmOrderPayment,
    // 503 은 결제가 실패한 것이 아니라 서버가 결과를 확인하지 못한 것이라 다시 물어본다.
    retry: (failureCount, error) =>
      failureCount < CONFIRM_RETRIES && isUnconfirmed(error),
    retryDelay: CONFIRM_RETRY_MS,
    onSuccess: () => {
      clearPendingOrderId();
      if (onConfirmed) {
        onConfirmed();
        return;
      }
      setDone(true);
    },
    onError: (error) => {
      clearPendingOrderId();
      setError(
        isUnconfirmed(error)
          ? "결제 결과를 확인하는 중이에요. 주문내역에서 확인해 주세요."
          : "결제 승인에 실패했어요. 주문내역에서 확인해 주세요.",
      );
    },
    // 성공이든 실패든 쿼리를 털어야 새로고침에 같은 승인이 다시 돌지 않는다.
    onSettled: () => router.replace(returnPath),
  });

  // 이미 승인을 보낸 세션. 세션 하나는 한 번만 쓸 수 있으므로 재요청을 막는다.
  // StrictMode 는 개발 모드에서 effect 를 두 번 실행하고, 복귀 URL 을 새로고침해도
  // 같은 orderId 로 다시 들어온다. 의존성 배열로는 둘 다 막지 못해 ref 로 기억한다.
  const confirmedSessionId = useRef<string | null>(null);

  // 결제를 마치고 돌아왔으면 승인 요청을 잇는다.
  useEffect(() => {
    if (!paidSessionId) return;
    if (confirmedSessionId.current === paidSessionId) return;

    const orderId = loadPendingOrderId();
    if (orderId === null) return;

    confirmedSessionId.current = paidSessionId;
    confirm.mutate(orderId);
    // 승인은 결제 복귀당 한 번이면 된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidSessionId]);

  const checkout = useMutation({
    mutationFn: async ({
      productId,
      name,
      quantity = 1,
    }: {
      productId: number;
      name: string;
      quantity?: number;
    }) => {
      // payerId 가 주문 응답에 실려 오므로 위젯은 주문을 받은 뒤에 띄운다.
      const order = await createOrder({ productId, quantity, liveId });
      const widgets = await loadPoint3Widgets(order.payerId);

      // 결제창으로 나가기 전에 남겨야 복귀 후 승인할 수 있다.
      savePendingOrderId(order.orderId);

      await requestPoint3Payment(widgets, {
        sessionId: order.sessionId,
        orderName: name,
        returnPath,
      });
    },
    // 결제창으로 넘어갔으면 뒤에 남은 시트가 복귀 후 다시 보이지 않게 닫는다.
    onSuccess: () => setConfirming(null),
    onError: () => {
      clearPendingOrderId();
      setConfirming(null);
      setError("결제창을 열지 못했어요. 다시 시도해 주세요.");
    },
  });

  return {
    /** 결제 완료 창을 띄울지. */
    done,
    closeDone: () => setDone(false),
    /** 결제 확인 시트에 올릴 상품. 닫혀 있으면 null. */
    confirming,
    closeConfirm: () => setConfirming(null),
    /** 확인 시트의 결제하기. 이때 비로소 주문이 만들어진다. */
    confirmBuy: () => confirming && checkout.mutate(confirming),
    message: error || failMessage,
    // 승인이 끝나기 전에 또 사면 앞 주문이 묻히므로 그동안 잠근다.
    pending: checkout.isPending || confirm.isPending || !!paidSessionId,
    buy: (product: Product) => {
      setError("");
      setConfirming(product);
    },
    /** 확인 시트 없이 바로 결제창까지 간다. 화면 자체가 이미 확인 단계인 경우에 쓴다. */
    buyNow: (product: Product) => {
      setError("");
      checkout.mutate(product);
    },
  };
}
