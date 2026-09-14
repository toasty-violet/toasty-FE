"use client";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import type { OrderStatusFilter } from "@/types/order";

import { getSellerOrders } from "./seller-order-api";

/**
 * 셀러 주문탭. 커서를 따라 이어 받는다.
 * 건수는 서버가 첫 묶음에만 실어 주므로 첫 페이지에서 꺼내 쓴다.
 */
export function useSellerOrders({ status }: { status: OrderStatusFilter }) {
  const query = useInfiniteQuery({
    queryKey: ["seller-orders", status],
    queryFn: ({ pageParam }) => getSellerOrders({ status, cursor: pageParam }),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => (last.hasNext ? last.nextCursor : null),
    placeholderData: keepPreviousData,
  });

  const pages = query.data?.pages ?? [];

  return {
    ...query,
    items: pages.flatMap((page) => page.items),
    counts: pages[0]?.counts ?? null,
  };
}
