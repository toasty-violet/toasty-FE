"use client";

import { useQuery } from "@tanstack/react-query";

import { getSellerProduct } from "../_lib/product-api";
import { ProductEditForm } from "./ProductEditForm";

/** 조회한 값으로 폼을 채우므로 값이 도착한 뒤에 폼을 올린다. */
export function ProductEditScreen({ productId }: { productId: number }) {
  const {
    data: product,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["seller-product", productId],
    queryFn: () => getSellerProduct(productId),
  });

  if (!product) {
    return (
      <p
        role={isError ? "alert" : undefined}
        className="text-b4-regular text-fg-neutral-secondary flex flex-1 px-20 pt-20"
      >
        {isPending ? "상품을 불러오는 중이에요." : "상품을 불러오지 못했어요."}
      </p>
    );
  }

  return <ProductEditForm product={product} />;
}
