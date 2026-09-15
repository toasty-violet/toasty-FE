"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/buttons/Button";
import {
  StoreProfileCard as StoreProfileCardView,
  StoreProfileCardError,
  StoreProfileCardSkeleton,
} from "@/components/cards/StoreProfileCard";
import { fetchSellerShop } from "@/lib/user";

const CARD_STYLE = "bg-bg-layer-default rounded-12 p-16";

export function StoreProfileCard() {
  const router = useRouter();
  const {
    data: shop,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["seller-shop"],
    queryFn: fetchSellerShop,
  });

  // 값이 비어도 카드 골격은 같으므로, 로딩·실패는 카드 자리를 그대로 채운다.
  if (isPending) {
    return <StoreProfileCardSkeleton className={CARD_STYLE} />;
  }

  if (isError) {
    return <StoreProfileCardError className={CARD_STYLE} />;
  }

  return (
    <StoreProfileCardView
      sellerId={shop.sellerId}
      shopImageUrl={shop.shopImageUrl}
      shopName={shop.shopName}
      followerCount={shop.followerCount}
      productCount={shop.productCount}
      description={shop.description}
      className={CARD_STYLE}
      action={
        <Button
          label="스토어 정보 수정"
          color="assistive"
          size="sm"
          fullWidth
          onClick={() => router.push("/shop/edit")}
        />
      }
    />
  );
}
