"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSellerShop } from "@/lib/user";

import { ShopEditForm } from "./ShopEditForm";

//조회한 스토어 정보로 수정 폼을 채운다
export function ShopEditScreen() {
  const {
    data: shop,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["seller-shop"],
    queryFn: fetchSellerShop,
  });

  // 조회한 값으로 폼을 초기화하므로, 값이 도착한 뒤에 마운트한다.
  if (!shop) {
    return (
      <p
        role={isError ? "alert" : undefined}
        className="text-b4-regular text-fg-neutral-secondary flex flex-1 px-20 pt-20"
      >
        {isPending
          ? "스토어 정보를 불러오는 중이에요."
          : "스토어 정보를 불러오지 못했어요."}
      </p>
    );
  }

  return <ShopEditForm shop={shop} />;
}
