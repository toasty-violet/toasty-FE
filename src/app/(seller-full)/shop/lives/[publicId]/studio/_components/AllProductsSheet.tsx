"use client";

import type { FC, SVGProps } from "react";

import { ProductSheet } from "@/app/live/_components/ProductSheet";
import { ProductSummary } from "@/app/live/_components/ProductSummary";
import EditIcon from "@/assets/Edit.svg";
import PinIcon from "@/assets/Pin.svg";
import type { LiveProduct } from "@/types/live";

import { SALE_STATUS } from "./sale-status";

const CIRCLE = "flex size-36 items-center justify-center rounded-full";

// 채운 버튼은 잠기면 색이 물러난다. #5b606b 는 semantic 이름이 없어 원색을 쓴다.
function circleTone(emphasized: boolean, disabled: boolean) {
  if (!emphasized) return "bg-bg-neutral-weak text-fg-neutral-solid";
  return disabled
    ? "bg-bg-neutral-disabled text-fg-neutral-inverted"
    : "bg-gray-800 text-fg-neutral-inverted";
}

function RoundAction({
  label,
  icon: Icon,
  emphasized = false,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  /** 눌러야 할 버튼임을 알릴 때 채운다. 잠기면 채운 색이 물러난다. */
  emphasized?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex shrink-0 flex-col items-center justify-center gap-6"
    >
      <span className={`${CIRCLE} ${circleTone(emphasized, disabled)}`}>
        {/* 아이콘 색이 박혀 있어 버튼 글자색을 따라가게 한다. */}
        <Icon className="size-24 [&_path]:fill-current" />
      </span>
      <span className="text-l7-medium text-fg-neutral-placeholder">
        {label}
      </span>
    </button>
  );
}

function ProductRow({
  product,
  isPinned,
  onEdit,
  onPin,
}: {
  product: LiveProduct;
  isPinned: boolean;
  onEdit: () => void;
  onPin: () => void;
}) {
  const sale = SALE_STATUS[product.status];

  return (
    <li className="flex w-full items-start gap-8">
      <ProductSummary
        product={product}
        isPinned={isPinned}
        badge={
          <span
            className={`rounded-6 text-l7-semibold px-5 pt-4 pb-5 ${sale.className}`}
          >
            {sale.label}
          </span>
        }
      />

      <div className="flex shrink-0 items-center gap-12 self-stretch">
        <RoundAction label="수정" icon={EditIcon} onClick={onEdit} />
        <RoundAction
          label="고정"
          icon={PinIcon}
          emphasized
          // 이미 고정했거나 다 판 상품은 소개할 수 없다.
          disabled={isPinned || product.status === "CLOSED"}
          onClick={onPin}
        />
      </div>
    </li>
  );
}

/** 이번 방송에 편성된 상품 전체. 여기서 소개할 상품을 고르거나 가격·재고를 고친다. */
export function AllProductsSheet({
  open,
  products,
  pinnedProductId,
  onClose,
  onEdit,
  onPin,
}: {
  open: boolean;
  products: LiveProduct[];
  pinnedProductId: number | null;
  onClose: () => void;
  onEdit: (product: LiveProduct) => void;
  onPin: (product: LiveProduct) => void;
}) {
  return (
    <ProductSheet open={open} isEmpty={products.length === 0} onClose={onClose}>
      {products.map((product) => (
        <ProductRow
          key={product.productId}
          product={product}
          isPinned={product.productId === pinnedProductId}
          onEdit={() => onEdit(product)}
          onPin={() => onPin(product)}
        />
      ))}
    </ProductSheet>
  );
}
