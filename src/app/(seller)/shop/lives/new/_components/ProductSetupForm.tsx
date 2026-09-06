"use client";

import { Input } from "@/components/inputs/Input";
import { BottomButton } from "@/components/buttons/BottomButton";
import CloseSmallIcon from "@/assets/Close Small.svg";
import MinusIcon from "@/assets/Minus.svg";
import PlusIcon from "@/assets/Plus.svg";
import type { DraftProduct } from "./draft-product";

const PRICE_FORMAT = new Intl.NumberFormat("ko-KR");

function StepperButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof MinusIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="bg-fg-neutral-disabled flex size-24 shrink-0 items-center justify-center rounded-full"
    >
      <Icon className="size-18" />
    </button>
  );
}

function ProductCard({
  product,
  onChange,
  onRemove,
}: {
  product: DraftProduct;
  onChange: (next: DraftProduct) => void;
  onRemove: () => void;
}) {
  const setStock = (next: number) =>
    onChange({ ...product, stockQuantity: Math.max(1, next) });

  return (
    <div className="flex w-full flex-col gap-20">
      <div className="flex w-full items-start justify-between">
        <div className="rounded-8 size-[7.6rem] overflow-hidden">
          {/* 로컬에서 고른 사진이라 next/image 의 최적화 대상이 아니다. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.previewUrl}
            alt=""
            className="size-full object-cover"
          />
        </div>
        <button type="button" aria-label="상품 빼기" onClick={onRemove}>
          <CloseSmallIcon className="size-24" />
        </button>
      </div>

      <Input
        title="상품명"
        placeholder="상품명을 입력해 주세요."
        value={product.name}
        clearable={false}
        onChange={(name) => onChange({ ...product, name })}
      />

      <div className="flex w-full items-start gap-16">
        <div className="min-w-0 flex-1">
          <Input
            title="가격(원)"
            placeholder="0"
            inputMode="numeric"
            clearable={false}
            value={product.price ? PRICE_FORMAT.format(product.price) : ""}
            onChange={(next) =>
              onChange({ ...product, price: Number(next.replace(/\D/g, "")) })
            }
          />
        </div>

        <div className="flex shrink-0 flex-col justify-center gap-8">
          <span className="text-l4-medium text-fg-neutral-strong">재고</span>
          <div className="flex items-center justify-center gap-10">
            <StepperButton
              icon={MinusIcon}
              label="재고 줄이기"
              onClick={() => setStock(product.stockQuantity - 1)}
              disabled={product.stockQuantity <= 1}
            />
            <div className="rounded-12 border-stroke-neutral-weak text-b1-regular text-fg-neutral-solid flex h-56 w-[6rem] items-center justify-center border px-16">
              {product.stockQuantity}
            </div>
            <StepperButton
              icon={PlusIcon}
              label="재고 늘리기"
              onClick={() => setStock(product.stockQuantity + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductSetupForm({
  products,
  onChange,
  onSubmit,
}: {
  products: DraftProduct[];
  onChange: (next: DraftProduct[]) => void;
  onSubmit: () => void;
}) {
  // 서버는 0 원도 받지만 결제 흐름이 아직 없어 화면에서 막는다.
  const isComplete =
    products.length > 0 &&
    products.every((product) => product.name.trim() && product.price > 0);

  return (
    <>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <h1 className="text-st1-semibold text-fg-neutral-solid px-20 pt-20">
          상품 정보를 입력해 주세요
        </h1>
        <p className="text-c2-medium text-fg-neutral-secondary px-20 pt-16">
          총 {products.length}개
        </p>

        <div className="flex flex-col gap-28 px-20 pt-16 pb-20">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              onChange={(next) =>
                onChange(products.map((it, i) => (i === index ? next : it)))
              }
              onRemove={() => onChange(products.filter((_, i) => i !== index))}
            />
          ))}
        </div>
      </div>

      <BottomButton
        label={`등록하기 (${products.length})`}
        disabled={!isComplete}
        onClick={onSubmit}
      />
    </>
  );
}
