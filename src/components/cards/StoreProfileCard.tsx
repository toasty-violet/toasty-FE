"use client";

import { type ReactNode, useState } from "react";
import Image from "next/image";

import DefaultImage from "@/assets/DefaultImage.svg";
import LinkIcon from "@/assets/Link.svg";
import { formatCountOrDash } from "@/lib/format";
import { isRenderableImageSrc } from "@/lib/upload";

// 공개 스토어 주소. 로컬·프리뷰에서 복사해도 손님에게 줄 수 있는 주소여야 해서
// window.location.origin 이 아니라 서비스 도메인을 그대로 쓴다.
const SHOP_LINK_ORIGIN = "https://toasty.kr";

type StoreProfileCardProps = {
  sellerId: number;
  shopImageUrl: string | null;
  shopName: string;
  followerCount: number;
  productCount: number;
  description: string;
  /** 링크 복사 버튼 왼쪽에 폭을 채우고 들어가는 주 버튼. 셀러는 정보 수정, 손님은 팔로우다. */
  action: ReactNode;
  className?: string;
};

export function StoreProfileCard({
  sellerId,
  shopImageUrl,
  shopName,
  followerCount,
  productCount,
  description,
  action,
  className = "",
}: StoreProfileCardProps) {
  const [copied, setCopied] = useState(false);

  const copyShopLink = async () => {
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

  return (
    <section
      className={`flex w-full flex-col items-center justify-center gap-16 ${className}`}
    >
      <div className="flex w-full items-center gap-12">
        <div className="border-stroke-neutral-weak bg-bg-neutral-weak relative size-48 shrink-0 overflow-hidden rounded-full border">
          {isRenderableImageSrc(shopImageUrl) ? (
            <Image
              src={shopImageUrl}
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
            {shopName}
          </h2>
          <p className="text-l6-regular text-fg-neutral-secondary w-full truncate">
            팔로워 {formatCountOrDash(followerCount)} · 상품{" "}
            {formatCountOrDash(productCount)}
          </p>
        </div>
      </div>

      {/* 소개는 줄바꿈을 그대로 살린다. */}
      <p className="text-b5-reading-regular text-fg-neutral-strong w-full whitespace-pre-line">
        {description}
      </p>

      <div className="flex w-full items-center justify-center gap-8">
        {action}
        <button
          type="button"
          aria-label="스토어 링크 복사"
          onClick={() => void copyShopLink()}
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

/** 불러오는 동안 카드와 같은 자리를 잡아 두는 스켈레톤. */
export function StoreProfileCardSkeleton({ className = "" }) {
  return (
    <section
      aria-hidden
      className={`flex w-full flex-col items-center justify-center gap-16 ${className}`}
    >
      <div className="flex w-full items-center gap-12">
        <div className="bg-bg-neutral-weak size-48 shrink-0 animate-pulse rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="bg-bg-neutral-weak rounded-4 h-16 w-2/5 animate-pulse" />
          <div className="bg-bg-neutral-weak rounded-4 h-11 w-3/5 animate-pulse" />
        </div>
      </div>

      {/* 소개는 두 줄까지 자주 차는 자리라 두 줄로 잡아 둔다. */}
      <div className="flex w-full flex-col gap-6">
        <div className="bg-bg-neutral-weak rounded-4 h-12 w-full animate-pulse" />
        <div className="bg-bg-neutral-weak rounded-4 h-12 w-3/5 animate-pulse" />
      </div>

      <div className="flex w-full items-center justify-center gap-8">
        <div className="bg-bg-neutral-weak rounded-8 h-36 flex-1 animate-pulse" />
        <div className="bg-bg-neutral-weak rounded-8 size-36 shrink-0 animate-pulse" />
      </div>
    </section>
  );
}

/** 카드 자리를 유지한 채 실패 문구만 남긴다. */
export function StoreProfileCardError({ className = "" }) {
  return (
    <section className={`w-full ${className}`}>
      <p role="alert" className="text-b4-regular text-fg-neutral-secondary">
        스토어 정보를 불러오지 못했어요.
      </p>
    </section>
  );
}
