"use client";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import type { OrderStatusFilter } from "@/types/order";

import { getMyOrders } from "./order-api";

/**
 * 주문내역. 커서를 따라 이어 받는다.
 * 건수는 서버가 첫 묶음에만 실어 주므로 첫 페이지에서 꺼내 쓴다.
 */
export function useMyOrders({ status }: { status: OrderStatusFilter }) {
  const query = useInfiniteQuery({
    queryKey: ["my-orders", status],
    queryFn: ({ pageParam }) => getMyOrders({ status, cursor: pageParam }),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => (last.hasNext ? last.nextCursor : null),
    // 칩을 바꾸면 키가 달라져 처음부터 받는다. 그동안 앞 묶음을 두어
    // 건수와 목록이 비었다가 다시 차는 깜빡임을 없앤다.
    placeholderData: keepPreviousData,
  });

  const pages = query.data?.pages ?? [];

  return {
    ...query,
    items: pages.flatMap((page) => page.items),
    counts: pages[0]?.counts ?? null,
  };
}
