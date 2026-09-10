"use client";

import { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/buttons/Button";
import { Input } from "@/components/inputs/Input";
import { BottomSheet } from "@/components/overlays/BottomSheet";
import type { LiveProduct } from "@/types/live";

const PRICE_FORMAT = new Intl.NumberFormat("ko-KR");

const onlyDigits = (value: string) => Number(value.replace(/\D/g, ""));

/**
 * 방송 중에 상품의 가격과 재고를 고친다.
 * 상품명·사진은 서버가 방송 중 수정을 받지 않아 보여주기만 한다.
 */
export function ProductEditSheet({
  product,
  saving,
  error,
  onSave,
  onClose,
}: {
  /** 고칠 상품. 없으면 시트가 닫힌 상태다. */
  product?: LiveProduct;
  saving: boolean;
  error: string | null;
  onSave: (values: { price: number; stockQuantity: number }) => void;
  onClose: () => void;
}) {
  // 시트를 다시 열 때 이전 값이 남지 않도록 상품이 바뀌면 새로 마운트한다.
  return (
    <BottomSheet
      open={product !== undefined}
      onClose={onClose}
      title="상품 수정"
    >
      {product && (
        <EditForm
          key={product.productId}
          product={product}
          saving={saving}
          error={error}
          onSave={onSave}
        />
      )}
    </BottomSheet>
  );
}

function EditForm({
  product,
  saving,
  error,
  onSave,
}: {
  product: LiveProduct;
  saving: boolean;
  error: string | null;
  onSave: (values: { price: number; stockQuantity: number }) => void;
}) {
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stockQuantity);

  // 서버는 가격 0 원은 받지만 재고는 1개 이상만 받는다.
  const canSave = stock >= 1 && !saving;

  return (
    <div className="flex w-full flex-col gap-24">
      <div className="flex w-full items-center gap-12">
        <span className="rounded-8 relative size-[5.6rem] shrink-0 overflow-hidden">
          <Image
            src={product.imageUrl}
            alt=""
            fill
            sizes="56px"
            unoptimized
            className="object-cover"
          />
        </span>
        <p className="text-l3-medium text-fg-neutral-solid min-w-0 flex-1 truncate">
          {product.name}
        </p>
      </div>

      <div className="flex w-full flex-col gap-16">
        <Input
          title="가격(원)"
          placeholder="0"
          inputMode="numeric"
          clearable={false}
          value={price ? PRICE_FORMAT.format(price) : ""}
          onChange={(next) => setPrice(onlyDigits(next))}
        />
        <Input
          title="재고 수량"
          placeholder="1"
          inputMode="numeric"
          clearable={false}
          value={stock ? String(stock) : ""}
          onChange={(next) => setStock(onlyDigits(next))}
          error={stock < 1}
          errorMessage="재고는 1개 이상이어야 합니다."
        />
      </div>

      {error && (
        <p role="alert" className="text-c1-medium text-fg-critical">
          {error}
        </p>
      )}

      <Button
        label={saving ? "저장하는 중…" : "저장하기"}
        size="lg"
        fullWidth
        disabled={!canSave}
        onClick={() => onSave({ price, stockQuantity: stock })}
      />
    </div>
  );
}
