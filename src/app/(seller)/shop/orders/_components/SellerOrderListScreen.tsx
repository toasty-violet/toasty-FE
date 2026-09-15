"use client";

import { useState } from "react";

import OrderEmptyIcon from "@/assets/OrderEmpty.svg";
import { OrderFilterChips } from "@/app/(customer)/orders/_components/OrderFilterChips";
import { useLoadMoreOnReach } from "@/hooks/use-load-more-on-reach";
import type { OrderStatusFilter } from "@/types/order";

import { useSellerOrders } from "../_lib/use-seller-orders";
import { SellerOrderCard } from "./SellerOrderCard";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const NOTICE_BG = "#1a1c200f"; // bg/overlay-subtle

export function SellerOrderListScreen() {
  const [status, setStatus] = useState<OrderStatusFilter>("ALL");
  const {
    items,
    counts,
    isPending,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSellerOrders({ status });

  // 받는 중에는 관찰을 끊는다. 그대로 두면 같은 묶음을 다시 부르며 앞 요청을 취소한다.
  const loadMore = useLoadMoreOnReach(fetchNextPage, {
    enabled: hasNextPage === true && !isFetchingNextPage,
  });

  return (
    <div className="bg-bg-neutral-weak flex flex-1 flex-col overflow-hidden">
      {/* 주문이 하나도 없으면 고를 것이 없어 칩을 두지 않는다. */}
      {counts?.all !== 0 && (
        <div className="w-full px-20 pt-20 pb-20">
          <OrderFilterChips
            status={status}
            counts={counts}
            onChange={setStatus}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-y-auto px-20 pb-20">
        {isPending && (
          <p className="text-b4-regular text-fg-neutral-secondary py-20 text-center">
            주문 내역을 불러오는 중이에요.
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="text-b4-regular text-fg-critical py-20 text-center"
          >
            주문 내역을 불러오지 못했어요.
          </p>
        )}
        {!isPending && !error && items.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-8">
            <OrderEmptyIcon className="size-[6rem] shrink-0" />
            <p className="text-t2-bold text-fg-neutral-primary text-center">
              주문 내역이 없어요
            </p>
          </div>
        )}
        {items.length > 0 && (
          <div className="flex w-full flex-col gap-12">
            <p
              className="text-c2-medium text-fg-neutral-secondary rounded-8 w-full px-12 py-8"
              style={{ backgroundColor: NOTICE_BG }}
            >
              운송장 번호 등록 시 구매자에게 배송 시작 알림이 전송돼요.
            </p>
            <ul className="flex w-full flex-col gap-12">
              {items.map((order) => (
                <SellerOrderCard key={order.orderId} order={order} />
              ))}
            </ul>
          </div>
        )}
        {/* 목록 끝에 닿으면 다음 묶음을 부른다. */}
        <div ref={loadMore} aria-hidden className="h-px w-full shrink-0" />
      </div>
    </div>
  );
}
