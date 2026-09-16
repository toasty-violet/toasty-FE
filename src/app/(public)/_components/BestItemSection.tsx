"use client";

import { useQuery } from "@tanstack/react-query";

import {
  ProductGridCard,
  ProductGridCardSkeleton,
} from "@/components/cards/ProductGridCard";
import { getBestProducts } from "@/lib/product-api";

// 상품이 몇 개 올지 모르지만, 스켈레톤은 자리를 잡아야 하므로 두 줄로 둔다.
const SKELETON_CARDS = [0, 1, 2, 3];

export function BestItemSection() {
  const { data, isPending, error } = useQuery({
    queryKey: ["products", "best"],
    queryFn: getBestProducts,
  });

  // 살 수 있는 상품이 없으면 제목까지 통째로 감춘다.
  if (error || (data && data.length === 0)) {
    return null;
  }

  return (
    <section className="flex w-full flex-col gap-14">
      <h2 className="text-t3-bold text-fg-neutral-solid w-full">
        베스트 아이템
      </h2>
      <ul className="grid w-full grid-cols-2 gap-x-12 gap-y-24">
        {isPending
          ? SKELETON_CARDS.map((card) => (
              <ProductGridCardSkeleton key={card} label />
            ))
          : data.map((product) => (
              <ProductGridCard
                key={product.productId}
                productId={product.productId}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl}
                label={product.shopName}
              />
            ))}
      </ul>
    </section>
  );
}
