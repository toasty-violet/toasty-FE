"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import {
  ProductGridCard,
  ProductGridCardSkeleton,
} from "@/components/cards/ProductGridCard";
import { useLoadMoreOnReach } from "@/hooks/use-load-more-on-reach";
import { getStoreProducts } from "@/lib/store-api";

// 상품이 몇 개 올지 모르지만, 스켈레톤은 자리를 잡아야 하므로 두 줄로 둔다.
const SKELETON_CARDS = [0, 1, 2, 3];

export function StoreProductsSection({ sellerId }: { sellerId: number }) {
  const {
    data,
    isPending,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["store-products", sellerId],
    queryFn: ({ pageParam }) => getStoreProducts(sellerId, pageParam),
    initialPageParam: null as number | null,
    getNextPageParam: (last) => (last.hasNext ? last.nextCursor : null),
  });

  // 받는 중에는 관찰을 끊는다. 그대로 두면 같은 묶음을 다시 부르며 앞 요청을 취소한다.
  const loadMore = useLoadMoreOnReach(fetchNextPage, {
    enabled: hasNextPage === true && !isFetchingNextPage,
  });

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  if (error) {
    return (
      <p role="alert" className="text-b4-regular text-fg-neutral-secondary">
        상품을 불러오지 못했어요.
      </p>
    );
  }

  if (!isPending && items.length === 0) {
    return (
      <p className="text-b4-regular text-fg-neutral-secondary">
        등록된 상품이 없어요.
      </p>
    );
  }

  return (
    <section className="flex w-full flex-col gap-14">
      <ul className="grid w-full grid-cols-2 gap-x-12 gap-y-24">
        {isPending
          ? SKELETON_CARDS.map((card) => <ProductGridCardSkeleton key={card} />)
          : items.map((product) => (
              <ProductGridCard
                key={product.productId}
                productId={product.productId}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
              />
            ))}
      </ul>
      {/* 목록 끝에 닿으면 다음 묶음을 부른다. */}
      <div ref={loadMore} aria-hidden className="h-px w-full shrink-0" />
    </section>
  );
}
