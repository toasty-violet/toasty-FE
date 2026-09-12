"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import DefaultImage from "@/assets/DefaultImage.svg";
import LinkIcon from "@/assets/Link.svg";
import { Button } from "@/components/buttons/Button";
import { formatCountOrDash } from "@/lib/format";
import { isRenderableImageSrc } from "@/lib/upload";
import { fetchSellerShop } from "@/lib/user";

// 공개 스토어 주소. 로컬·프리뷰에서 복사해도 손님에게 줄 수 있는 주소여야 해서
// window.location.origin 이 아니라 서비스 도메인을 그대로 쓴다.
const SHOP_LINK_ORIGIN = "https://toasty.kr";

export function StoreProfileCard() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const {
    data: shop,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["seller-shop"],
    queryFn: fetchSellerShop,
  });

  const copyShopLink = async (sellerId: number) => {
    // 클립보드는 HTTPS·사용자 제스처가 있어야 쓸 수 있어, 막힌 환경에서는 조용히 실패한다.
    try {
      await navigator.clipboard.writeText(
        `${SHOP_LINK_ORIGIN}/shop/${sellerId}`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  // 값이 비어도 카드 골격은 같으므로, 로딩·실패는 카드 자리에 문구만 남긴다.
  if (isPending || isError) {
    return (
      <section className="bg-bg-layer-default rounded-12 w-full p-16">
        <p
          role={isError ? "alert" : undefined}
          className="text-b4-regular text-fg-neutral-secondary"
        >
          {isError
            ? "스토어 정보를 불러오지 못했어요."
            : "스토어 정보를 불러오는 중이에요."}
        </p>
      </section>
    );
  }

  return (
    <section className="bg-bg-layer-default rounded-12 flex w-full flex-col items-center justify-center gap-16 p-16">
      <div className="flex w-full items-center gap-12">
        <div className="border-stroke-neutral-weak bg-bg-neutral-weak relative size-48 shrink-0 overflow-hidden rounded-full border">
          {isRenderableImageSrc(shop.shopImageUrl) ? (
            <Image
              src={shop.shopImageUrl}
              alt=""
              fill
              sizes="48px"
              unoptimized
              className="object-cover"
            />
          ) : (
            <DefaultImage className="size-full" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <h2 className="text-st1-semibold text-fg-neutral-solid w-full truncate">
            {shop.shopName}
          </h2>
          <p className="text-l6-regular text-fg-neutral-secondary w-full truncate">
            팔로워 {formatCountOrDash(shop.followerCount)} · 상품{" "}
            {formatCountOrDash(shop.productCount)}
          </p>
        </div>
      </div>

      {/* 소개는 줄바꿈을 그대로 살린다. */}
      <p className="text-b5-reading-regular text-fg-neutral-strong w-full whitespace-pre-line">
        {shop.description}
      </p>

      <div className="flex w-full items-center justify-center gap-8">
        <Button
          label="스토어 정보 수정"
          color="assistive"
          size="sm"
          fullWidth
          onClick={() => router.push("/shop/edit")}
        />
        <button
          type="button"
          aria-label="스토어 링크 복사"
          onClick={() => void copyShopLink(shop.sellerId)}
          className="bg-bg-neutral-weak rounded-8 flex size-36 shrink-0 items-center justify-center"
        >
          <LinkIcon className="text-fg-neutral-primary size-18 [&_path]:fill-current" />
        </button>
      </div>

      {/* 복사는 화면이 그대로라 티가 나지 않으므로 잠깐 문구를 남긴다. */}
      {copied && (
        <p role="status" className="text-c1-medium text-fg-neutral-secondary">
          스토어 링크를 복사했어요.
        </p>
      )}
    </section>
  );
}
