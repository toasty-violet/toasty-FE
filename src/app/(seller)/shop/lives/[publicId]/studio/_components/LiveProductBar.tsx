"use client";

import Image from "next/image";
import type { FC, SVGProps } from "react";

import EditIcon from "@/assets/Edit.svg";
import PinIcon from "@/assets/Pin.svg";
import type { LiveProduct } from "@/types/live";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const OVERLAY = "#1a1c20b2"; // bg/overlay
const OVERLAY_INVERSE_SUBTLE = "#ffffff1f"; // bg/overlay-inverse-subtle

function ActionButton({
  label,
  icon: Icon,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ backgroundColor: OVERLAY_INVERSE_SUBTLE }}
      className="rounded-8 text-l5-semibold text-fg-neutral-inverted flex h-36 min-w-0 flex-1 items-center justify-center gap-4 px-16 backdrop-blur-[5px] disabled:opacity-50"
    >
      {/* 아이콘 색이 박혀 있어 버튼 글자색을 따라가게 한다. */}
      <Icon className="size-18 shrink-0 [&_path]:fill-current" />
      {label}
    </button>
  );
}

/** 지금 소개 중인 상품. 아직 아무것도 고정하지 않았으면 자리만 지킨다. */
function PinnedCard({ product }: { product?: LiveProduct }) {
  if (!product) {
    return (
      <div className="bg-bg-layer-default rounded-10 text-l5-medium text-fg-neutral-secondary flex min-w-0 flex-1 items-center p-8">
        아직 소개 중인 상품이 없어요.
      </div>
    );
  }

  const soldOut = product.stockQuantity === 0;

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

      <span
        className={`rounded-6 text-l7-semibold flex shrink-0 items-center justify-center px-5 pt-4 pb-5 ${
          soldOut
            ? "bg-bg-neutral-weak text-fg-neutral-secondary"
            : "bg-bg-brand-weak text-fg-brand"
        }`}
      >
        {soldOut ? "품절" : "판매중"}
      </span>
    </div>
  );
}

/** 방송 화면 아래에 얹히는 상품 영역. 고정된 상품과 상품을 다루는 버튼을 묶는다. */
export function LiveProductBar({
  pinned,
  totalCount,
  pinning,
  onOpenAllProducts,
  onEditPinned,
  onPinNext,
}: {
  pinned?: LiveProduct;
  totalCount: number;
  pinning: boolean;
  onOpenAllProducts: () => void;
  onEditPinned: () => void;
  onPinNext: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex w-full items-end gap-8">
        <PinnedCard product={pinned} />

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

      <div className="flex w-full items-center gap-8">
        <ActionButton
          label="현재 상품 수정"
          icon={EditIcon}
          disabled={!pinned}
          onClick={onEditPinned}
        />
        <ActionButton
          label={pinning ? "고정하는 중…" : "다음 상품 고정"}
          icon={PinIcon}
          disabled={pinning || totalCount === 0}
          onClick={onPinNext}
        />
      </div>
    </div>
  );
}
