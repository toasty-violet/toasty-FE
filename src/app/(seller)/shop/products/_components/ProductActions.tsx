"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ConfirmModal } from "@/components/overlays/ConfirmModal";
import type { SellerProduct } from "@/types/product";

import { deleteSellerProduct } from "../_lib/product-api";
import { describeDeleteError } from "../_lib/product-error";
import { ProductMoreSheet } from "./ProductMoreSheet";

/**
 * 더보기에서 이어지는 수정·삭제. 목록과 검색이 같은 흐름을 쓴다.
 * 고른 상품이 있으면 시트를 열고, 삭제는 확인을 받은 뒤 보낸다.
 */
export function ProductActions({
  product,
  onClose,
}: {
  product: SellerProduct | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [asking, setAsking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const remove = useMutation({
    mutationFn: (productId: number) => deleteSellerProduct(productId),
    onSuccess: () => {
      setAsking(false);
      onClose();
      queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
    // 방송 중이거나 그 라이브의 마지막 상품이면 서버가 막는다. 이유를 그대로 보여준다.
    onError: (failure) => {
      setAsking(false);
      setMessage(describeDeleteError(failure));
    },
  });

  const dismiss = () => {
    setMessage(null);
    onClose();
  };

  return (
    <>
      <ProductMoreSheet
        open={product !== null && !asking && message === null}
        productName={product?.name ?? ""}
        onClose={onClose}
        onEdit={() =>
          product && router.push(`/shop/products/${product.productId}/edit`)
        }
        onDelete={() => setAsking(true)}
      />

      <ConfirmModal
        open={asking}
        title="상품을 삭제할까요?"
        description="편성된 라이브에서도 함께 빠집니다."
        confirmLabel="삭제하기"
        tone="critical"
        confirming={remove.isPending}
        onConfirm={() => product && remove.mutate(product.productId)}
        onClose={() => setAsking(false)}
      />

      <ConfirmModal
        open={message !== null}
        title="삭제할 수 없어요"
        description={message ?? ""}
        confirmLabel="확인"
        onConfirm={dismiss}
        onClose={dismiss}
      />
    </>
  );
}
