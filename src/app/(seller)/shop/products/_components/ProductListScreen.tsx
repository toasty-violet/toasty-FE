"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import SearchIcon from "@/assets/Search.svg";
import type { SellerProduct, SellerProductFilter } from "@/types/product";

import { useLoadMoreOnReach } from "@/hooks/use-load-more-on-reach";

import { useSellerProducts } from "../_lib/use-seller-products";
import { ProductActions } from "./ProductActions";
import { ProductFilterChips } from "./ProductFilterChips";
import { SellerProductRow } from "./SellerProductRow";

export function ProductListScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<SellerProductFilter>("ALL");
  const [picked, setPicked] = useState<SellerProduct | null>(null);

  const {
    items,
    counts,
    isPending,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSellerProducts({ status });

  // 받는 중에는 관찰을 끊는다. 그대로 두면 같은 묶음을 다시 부르며 앞 요청을 취소한다.
  const loadMore = useLoadMoreOnReach(fetchNextPage, {
    enabled: hasNextPage === true && !isFetchingNextPage,
  });

  return (
    <div className="bg-bg-neutral-weak flex flex-1 flex-col overflow-hidden">
      <div className="flex w-full items-center gap-12 px-20 pt-20 pb-16">
        <ProductFilterChips
          status={status}
          counts={counts}
          onChange={setStatus}
        />

        <button
          type="button"
          aria-label="상품 검색"
          onClick={() => router.push("/shop/products/search")}
          className="text-fg-neutral-icon shrink-0"
        >
          <SearchIcon className="size-24 [&_path]:fill-current" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-12 overflow-y-auto px-20 pb-20">
        {isPending && (
          <p className="text-b4-regular text-fg-neutral-secondary py-20 text-center">
            상품을 불러오는 중이에요.
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="text-b4-regular text-fg-critical py-20 text-center"
          >
            상품을 불러오지 못했어요.
          </p>
        )}

        {!isPending && !error && items.length === 0 && (
          <p className="text-b4-regular text-fg-neutral-secondary py-20 text-center">
            등록된 상품이 없어요.
          </p>
        )}

        {items.map((product) => (
          <div
            key={product.productId}
            className="bg-bg-layer-default rounded-12 w-full p-16"
          >
            <SellerProductRow
              product={product}
              onMore={() => setPicked(product)}
            />
          </div>
        ))}

        {/* 목록 끝에 닿으면 다음 묶음을 부른다. */}
        <div ref={loadMore} aria-hidden className="h-px w-full shrink-0" />
      </div>

      <ProductActions product={picked} onClose={() => setPicked(null)} />
    </div>
  );
}
