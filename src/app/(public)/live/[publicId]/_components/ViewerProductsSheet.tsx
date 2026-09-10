"use client";

import { Fragment } from "react";

import { ProductSheet } from "@/app/live/_components/ProductSheet";
import { ProductSummary } from "@/app/live/_components/ProductSummary";
import { Button } from "@/components/buttons/Button";
import type { LiveProduct } from "@/types/live";

/**
 * 살 수 있는지는 편성 상태와 재고가 함께 정한다.
 * 아직 소개하지 않은 상품(SCHEDULED)은 서버가 구매를 막으므로 버튼을 두지 않는다.
 */
function buyState(product: LiveProduct) {
  if (product.status === "SCHEDULED") return "notYet";
  return product.stockQuantity > 0 ? "buyable" : "soldOut";
}

function ProductRow({
  product,
  isPinned,
  buyDisabled,
  onBuy,
}: {
  product: LiveProduct;
  isPinned: boolean;
  buyDisabled: boolean;
  onBuy: () => void;
}) {
  const state = buyState(product);

  return (
    <li className="flex min-h-[6.8rem] w-full items-center gap-12 overflow-hidden">
      <ProductSummary product={product} isPinned={isPinned} />

      {state !== "notYet" && (
        <Button
          label={state === "soldOut" ? "품절" : "구매하기"}
          size="xs"
          disabled={buyDisabled || state === "soldOut"}
          onClick={onBuy}
        />
      )}
    </li>
  );
}

/** 이번 방송에 편성된 상품 전체. 살 수 있는 상품은 여기서 바로 산다. */
export function ViewerProductsSheet({
  open,
  products,
  pinnedProductId,
  buyDisabled = false,
  onClose,
  onBuy,
}: {
  open: boolean;
  products: LiveProduct[];
  pinnedProductId: number | null;
  /** 비로그인처럼 아직 살 수 없는 경우. */
  buyDisabled?: boolean;
  onClose: () => void;
  onBuy: (product: LiveProduct) => void;
}) {
  return (
    <ProductSheet open={open} isEmpty={products.length === 0} onClose={onClose}>
      {products.map((product, index) => (
        <Fragment key={product.productId}>
          {index > 0 && (
            <li className="bg-stroke-neutral-weak h-px w-full" aria-hidden />
          )}
          <ProductRow
            product={product}
            isPinned={product.productId === pinnedProductId}
            buyDisabled={buyDisabled}
            onBuy={() => onBuy(product)}
          />
        </Fragment>
      ))}
    </ProductSheet>
  );
}
