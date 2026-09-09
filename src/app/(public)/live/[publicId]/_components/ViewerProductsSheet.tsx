"use client";

import Image from "next/image";
import { Fragment } from "react";

import PinIcon from "@/assets/Pin.svg";
import { Button } from "@/components/buttons/Button";
import { BottomSheet } from "@/components/overlays/BottomSheet";
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
  onBuy,
}: {
  product: LiveProduct;
  isPinned: boolean;
  onBuy: () => void;
}) {
  const state = buyState(product);

  return (
    <li className="flex h-[6.8rem] w-full items-center gap-12 overflow-hidden">
      <span className="rounded-8 relative size-[6.8rem] shrink-0 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt=""
          fill
          sizes="68px"
          unoptimized
          className="object-cover"
        />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {isPinned && (
          <span className="text-l7-semibold text-fg-brand flex items-center gap-4">
            <PinIcon className="size-12 [&_path]:fill-current" />
            현재 고정 상품
          </span>
        )}

        <p className="text-l5-medium text-fg-neutral-solid truncate">
          {product.name}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <span
            className={`text-l4-semibold ${isPinned ? "text-fg-brand" : "text-fg-neutral-solid"}`}
          >
            {product.price.toLocaleString("ko-KR")}원
          </span>
          <span className="text-l7-medium text-fg-neutral-secondary">
            재고 {product.stockQuantity}개
          </span>
        </div>
      </div>

      {state !== "notYet" && (
        <Button
          label={state === "soldOut" ? "품절" : "구매하기"}
          size="xs"
          disabled={state === "soldOut"}
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
  onClose,
  onBuy,
}: {
  open: boolean;
  products: LiveProduct[];
  pinnedProductId: number | null;
  onClose: () => void;
  onBuy: (product: LiveProduct) => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="전체 상품">
      {products.length === 0 ? (
        <p className="text-l5-medium text-fg-neutral-secondary py-20">
          편성된 상품이 없어요.
        </p>
      ) : (
        <ul className="flex w-full flex-1 flex-col gap-12">
          {products.map((product, index) => (
            <Fragment key={product.productId}>
              {index > 0 && (
                <li
                  className="bg-stroke-neutral-weak h-px w-full"
                  aria-hidden
                />
              )}
              <ProductRow
                product={product}
                isPinned={product.productId === pinnedProductId}
                onBuy={() => onBuy(product)}
              />
            </Fragment>
          ))}
        </ul>
      )}
    </BottomSheet>
  );
}
