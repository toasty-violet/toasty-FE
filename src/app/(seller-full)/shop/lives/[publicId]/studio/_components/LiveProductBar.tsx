"use client";

import type { FC, SVGProps } from "react";

import { AllProductsButton } from "@/app/live/_components/AllProductsButton";
import { PinnedProductCard } from "@/app/live/_components/PinnedProductCard";
import EditIcon from "@/assets/Edit.svg";
import PinIcon from "@/assets/Pin.svg";
import type { LiveProduct } from "@/types/live";

import { SALE_STATUS } from "./sale-status";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const OVERLAY_INVERSE_SUBTLE = "#ffffff1f"; // bg/overlay-inverse-subtle

function ActionButton({
  label,
  icon: Icon,
  /** 눌러야 할 버튼임을 알릴 때 채운다. */
  emphasized = false,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  emphasized?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={
        emphasized ? undefined : { backgroundColor: OVERLAY_INVERSE_SUBTLE }
      }
      className={`rounded-8 text-l5-semibold text-fg-neutral-inverted flex h-36 min-w-0 flex-1 items-center justify-center gap-4 px-16 disabled:opacity-50 ${
        emphasized ? "bg-bg-brand-solid" : "backdrop-blur-[5px]"
      }`}
    >
      {/* 아이콘 색이 박혀 있어 버튼 글자색을 따라가게 한다. */}
      <Icon className="size-18 shrink-0 [&_path]:fill-current" />
      {label}
    </button>
  );
}

/** 카드 오른쪽에 붙는 판매 상태 배지. */
function SaleBadge({ status }: { status: LiveProduct["status"] }) {
  const sale = SALE_STATUS[status];
  return (
    <span
      className={`rounded-6 text-l7-semibold flex shrink-0 self-start px-5 pt-4 pb-5 ${sale.className}`}
    >
      {sale.label}
    </span>
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
        <PinnedProductCard
          product={pinned}
          trailing={pinned && <SaleBadge status={pinned.status} />}
        />

        <AllProductsButton
          totalCount={totalCount}
          onClick={onOpenAllProducts}
        />
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
          // 지금 소개 중인 상품을 다 팔았으면 다음으로 넘기라고 알린다.
          emphasized={pinned?.status === "CLOSED"}
          disabled={pinning || totalCount === 0}
          onClick={onPinNext}
        />
      </div>
    </div>
  );
}
