"use client";

import { AllProductsButton } from "@/app/live/_components/AllProductsButton";
import { PinnedProductCard } from "@/app/live/_components/PinnedProductCard";
import { Button } from "@/components/buttons/Button";
import type { LiveProduct } from "@/types/live";

/** 시청 화면 아래에 얹히는 상품 영역. 지금 소개 중인 상품과 전체 상품으로 가는 길이다. */
export function ViewerProductBar({
  pinned,
  totalCount,
  buyDisabled = false,
  onOpenAllProducts,
  onBuy,
}: {
  pinned?: LiveProduct;
  totalCount: number;
  /** 비로그인처럼 아직 살 수 없는 경우. */
  buyDisabled?: boolean;
  onOpenAllProducts: () => void;
  onBuy: () => void;
}) {
  return (
    <div className="flex w-full items-end gap-8">
      <PinnedProductCard
        product={pinned}
        trailing={
          pinned && (
            <Button
              label="구매하기"
              size="xs"
              disabled={buyDisabled || pinned.stockQuantity === 0}
              onClick={onBuy}
            />
          )
        }
      />

      <AllProductsButton totalCount={totalCount} onClick={onOpenAllProducts} />
    </div>
  );
}
