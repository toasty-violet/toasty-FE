"use client";

import Image from "next/image";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const SHOP_NAME = "#5b606b"; // fg/neutral-weak

/** 주문에 담긴 상품 한 줄. 목록 카드와 주문 상세가 같은 모양을 쓴다. */
export function OrderProductRow({
  shopName,
  productName,
  quantity,
  totalAmount,
  imageUrl,
}: {
  shopName: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  imageUrl: string;
}) {
  return (
    <div className="flex w-full items-center gap-12 overflow-hidden">
      <span className="rounded-8 relative size-[6.8rem] shrink-0 overflow-hidden">
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="68px"
          unoptimized
          className="object-cover"
        />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <span className="text-l6-regular truncate" style={{ color: SHOP_NAME }}>
          {shopName}
        </span>
        <span className="text-l6-medium text-fg-neutral-solid truncate">
          {productName}
        </span>
        <span className="text-l7-regular text-fg-neutral-secondary truncate">
          {quantity}개
        </span>
        <span className="text-l4-semibold text-fg-neutral-solid truncate">
          {totalAmount.toLocaleString("ko-KR")}원
        </span>
      </div>
    </div>
  );
}
