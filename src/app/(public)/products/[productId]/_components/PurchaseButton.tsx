"use client";

import { useRouter } from "next/navigation";

import { BottomButton } from "@/components/buttons/BottomButton";

export function PurchaseButton({ productId }: { productId: number }) {
  const router = useRouter();

  return (
    <BottomButton
      label="구매하기"
      onClick={() => router.push(`/products/payments?productId=${productId}`)}
    />
  );
}
