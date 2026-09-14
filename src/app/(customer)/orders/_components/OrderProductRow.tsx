"use client";

import Image from "next/image";

/**
 * 주문에 담긴 상품 한 줄. 목록 카드와 주문 상세가 같은 모양을 쓴다.
 * 맨 윗줄 label 에는 구매자 화면은 스토어 이름을, 셀러 화면은 받는사람을 둔다.
 */
export function OrderProductRow({
  label,
  productName,
  quantity,
  totalAmount,
  imageUrl,
}: {
  label?: string;
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
        {label && (
          <span className="text-l6-regular text-fg-neutral-primary truncate">
            {label}
          </span>
        )}
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
