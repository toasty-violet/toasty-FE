"use client";

import Image from "next/image";
import type { FC, SVGProps } from "react";

import EditIcon from "@/assets/Edit.svg";
import PinIcon from "@/assets/Pin.svg";
import { BottomSheet } from "@/components/overlays/BottomSheet";
import type { LiveProduct } from "@/types/live";

function RoundAction({
  label,
  icon: Icon,
  strong = false,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  strong?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex shrink-0 flex-col items-center justify-center gap-6 disabled:opacity-40"
    >
      <span
        className={`flex size-36 items-center justify-center rounded-full ${
          strong
            ? "bg-fg-neutral-primary text-fg-neutral-inverted"
            : "bg-bg-neutral-weak text-fg-neutral-solid"
        }`}
      >
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
  const soldOut = product.stockQuantity === 0;

  return (
    <li className="flex w-full items-start gap-8">
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
          <div className="flex flex-wrap items-center gap-4">
            {isPinned && (
              <span className="rounded-6 text-l7-semibold bg-bg-brand-weak text-fg-brand flex items-center gap-4 px-5 pt-4 pb-5">
                <PinIcon className="size-12 [&_path]:fill-current" />
                현재 고정 상품
              </span>
            )}
            <span
              className={`rounded-6 text-l7-semibold px-5 pt-4 pb-5 ${
                soldOut
                  ? "bg-bg-neutral-weak text-fg-neutral-secondary"
                  : "bg-bg-brand-weak text-fg-brand"
              }`}
            >
              {soldOut ? "판매대기" : "판매중"}
            </span>
          </div>

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

      <div className="flex shrink-0 items-center gap-12 self-stretch">
        <RoundAction label="수정" icon={EditIcon} onClick={onEdit} />
        <RoundAction
          label="고정"
          icon={PinIcon}
          strong
          disabled={isPinned}
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
    <BottomSheet open={open} onClose={onClose} title="전체 상품">
      {products.length === 0 ? (
        <p className="text-l5-medium text-fg-neutral-secondary py-20">
          편성된 상품이 없어요.
        </p>
      ) : (
        <ul className="flex w-full flex-1 flex-col gap-12">
          {products.map((product) => (
            <ProductRow
              key={product.productId}
              product={product}
              isPinned={product.productId === pinnedProductId}
              onEdit={() => onEdit(product)}
              onPin={() => onPin(product)}
            />
          ))}
        </ul>
      )}
    </BottomSheet>
  );
}
