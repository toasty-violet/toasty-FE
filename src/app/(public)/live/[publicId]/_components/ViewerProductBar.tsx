"use client";

import Image from "next/image";

import type { LiveProduct } from "@/types/live";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const OVERLAY = "#1a1c20b2"; // bg/overlay

/** 시청 화면 아래에 얹히는 상품 영역. 지금 소개 중인 상품과 전체 상품으로 가는 길이다. */
export function ViewerProductBar({
  pinned,
  totalCount,
  onOpenAllProducts,
  onBuy,
}: {
  pinned?: LiveProduct;
  totalCount: number;
  onOpenAllProducts: () => void;
  onBuy: () => void;
}) {
  return (
    <div className="flex w-full items-end gap-8">
      {pinned ? (
        <div className="bg-bg-layer-default rounded-10 flex min-w-0 flex-1 items-center gap-12 overflow-hidden p-8">
          <span className="rounded-8 relative size-48 shrink-0 overflow-hidden">
            <Image
              src={pinned.imageUrl}
              alt=""
              fill
              sizes="48px"
              unoptimized
              className="object-cover"
            />
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <p className="text-l5-medium text-fg-neutral-solid truncate">
              {pinned.name}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-l4-semibold text-fg-brand">
                {pinned.price.toLocaleString("ko-KR")}원
              </span>
              <span className="text-l7-medium text-fg-neutral-secondary">
                재고 {pinned.stockQuantity}개
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onBuy}
            className="rounded-8 text-l5-semibold bg-bg-brand-solid text-fg-neutral-inverted flex h-36 shrink-0 items-center justify-center px-16"
          >
            구매하기
          </button>
        </div>
      ) : (
        <div className="bg-bg-layer-default rounded-10 text-l5-medium text-fg-neutral-secondary flex min-h-[6.4rem] min-w-0 flex-1 items-center p-8">
          아직 소개 중인 상품이 없어요.
        </div>
      )}

      <button
        type="button"
        onClick={onOpenAllProducts}
        style={{ backgroundColor: OVERLAY }}
        className="rounded-10 text-fg-neutral-inverted flex shrink-0 flex-col items-center justify-center gap-4 self-stretch px-12"
      >
        <span className="text-l3-medium">{totalCount}</span>
        <span className="text-l7-regular">전체상품</span>
      </button>
    </div>
  );
}
