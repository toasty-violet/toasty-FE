"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import type { LiveProduct } from "@/types/live";

/**
 * 지금 소개 중인 상품 카드. 셀러 송출과 구매자 시청이 함께 쓴다.
 * 아직 아무것도 고정하지 않았으면 자리만 지킨다.
 */
export function PinnedProductCard({
  product,
  trailing,
}: {
  product?: LiveProduct;
  /** 카드 오른쪽 끝. 셀러는 판매 상태 배지, 구매자는 구매 버튼이다. */
  trailing?: ReactNode;
}) {
  if (!product) {
    return (
      <div className="bg-bg-layer-default rounded-10 text-l5-medium text-fg-neutral-secondary flex min-h-[6.4rem] min-w-0 flex-1 items-center p-8">
        아직 소개 중인 상품이 없어요.
      </div>
    );
  }

  return (
    <div className="bg-bg-layer-default rounded-10 flex min-w-0 flex-1 items-center gap-12 overflow-hidden p-8">
      <span className="rounded-8 relative size-48 shrink-0 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt=""
          fill
          sizes="48px"
          unoptimized
          className="object-cover"
        />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <p className="text-l5-medium text-fg-neutral-solid truncate">
          {product.name}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-l4-semibold text-fg-brand">
            {product.price.toLocaleString("ko-KR")}원
          </span>
          <span className="text-l7-medium text-fg-neutral-secondary">
            재고 {product.stockQuantity}개
          </span>
        </div>
      </div>

      {trailing}
    </div>
  );
}
