"use client";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import type { SellerProductFilter } from "@/types/product";

import { getSellerProducts } from "./product-api";

/**
 * 상품탭 목록. 커서를 따라 이어 받는다.
 * 건수는 서버가 첫 묶음에만 실어 주므로 첫 페이지에서 꺼내 쓴다.
 */
export function useSellerProducts({
  status,
  keyword = "",
  enabled = true,
}: {
  status: SellerProductFilter;
  keyword?: string;
  /** 검색 화면은 적기 전에는 묻지 않는다. */
  enabled?: boolean;
}) {
  const query = useInfiniteQuery({
    queryKey: ["seller-products", status, keyword],
    queryFn: ({ pageParam }) =>
      getSellerProducts({ status, cursor: pageParam, keyword }),
    enabled,
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
