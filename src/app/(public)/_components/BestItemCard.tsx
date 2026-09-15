import Link from "next/link";

import DefaultImage from "@/assets/DefaultImage.svg";
import { formatThousand } from "@/lib/format";
import type { BestProduct } from "@/types/product";

/** 홈 베스트 아이템 한 장. 카드 전체가 상품 상세로 가는 링크다. */
export function BestItemCard({ product }: { product: BestProduct }) {
  return (
    <li>
      <Link
        href={`/products/${product.productId}`}
        className="flex w-full flex-col gap-12"
      >
        <div className="rounded-8 bg-bg-neutral-weak aspect-[4/5] w-full overflow-hidden">
          {/* 사진을 등록하지 않은 상품은 기본 이미지로 채운다. */}
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <DefaultImage className="size-full" />
          )}
        </div>
        <div className="flex w-full flex-col gap-8 px-2">
          {product.shopName && (
            <p className="text-l6-medium text-fg-neutral-primary w-full truncate">
              {product.shopName}
            </p>
          )}
          <p className="text-l5-regular text-fg-neutral-solid w-full truncate">
            {product.name}
          </p>
          <p className="text-l5-semibold text-fg-neutral-solid w-full truncate">
            {formatThousand(product.price)}원
          </p>
        </div>
      </Link>
    </li>
  );
}

export function BestItemCardSkeleton() {
  return (
    <li className="flex w-full flex-col gap-12">
      <div className="rounded-8 bg-bg-neutral-weak aspect-[4/5] w-full animate-pulse" />
      <div className="flex w-full flex-col gap-8 px-2">
        <div className="bg-bg-neutral-weak rounded-4 h-11 w-2/5 animate-pulse" />
        <div className="bg-bg-neutral-weak rounded-4 h-12 w-full animate-pulse" />
        <div className="bg-bg-neutral-weak rounded-4 h-12 w-3/5 animate-pulse" />
      </div>
    </li>
  );
}
