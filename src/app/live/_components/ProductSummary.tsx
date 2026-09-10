"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import PinIcon from "@/assets/Pin.svg";
import type { LiveProduct } from "@/types/live";

/**
 * 전체 상품 시트 한 줄의 상품 설명. 셀러와 구매자가 함께 쓴다.
 * 줄 끝에 붙는 버튼은 화면마다 달라 각자 시트에서 붙인다.
 */
export function ProductSummary({
  product,
  isPinned,
  badge,
}: {
  product: LiveProduct;
  isPinned: boolean;
  /** 고정 표시 옆에 함께 놓을 것. 셀러는 판매 상태를 붙인다. */
  badge?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-12 overflow-hidden">
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
        {(isPinned || badge) && (
          <div className="flex flex-wrap items-center gap-4">
            {isPinned && (
              <span className="text-l7-semibold text-fg-brand flex items-center gap-4">
                <PinIcon className="size-12 [&_path]:fill-current" />
                현재 고정 상품
              </span>
            )}
            {badge}
          </div>
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
    </div>
  );
}
