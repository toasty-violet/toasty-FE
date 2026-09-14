"use client";

import Image from "next/image";

import MoreIcon from "@/assets/More.svg";
import type { SellerProduct } from "@/types/product";

import { PRODUCT_STATUS } from "./product-status";

/**
 * 상품 한 줄. 목록은 카드로 감싸고 검색은 구분선으로 나눠 껍데기만 다르다.
 * 오른쪽 더보기에서 수정·삭제로 들어간다.
 */
export function SellerProductRow({
  product,
  onMore,
}: {
  product: SellerProduct;
  onMore: () => void;
}) {
  const status = PRODUCT_STATUS[product.salesType];

  return (
    <div className="flex w-full items-center gap-12 overflow-hidden">
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

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-6">
        <span
          className={`rounded-6 text-l7-semibold flex w-fit px-5 pt-4 pb-5 ${status.className}`}
        >
          {status.label}
        </span>

        <p className="text-l5-medium text-fg-neutral-solid truncate">
          {product.name}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <span className="text-l4-semibold text-fg-neutral-solid">
            {product.price.toLocaleString("ko-KR")}원
          </span>
          <span className="text-l7-medium text-fg-neutral-secondary">
            재고 {product.stockQuantity}개
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onMore}
        aria-label={`${product.name} 더보기`}
        className="text-fg-neutral-icon shrink-0 self-start"
      >
        <MoreIcon className="h-24 w-8 [&_path]:fill-current" />
      </button>
    </div>
  );
}
