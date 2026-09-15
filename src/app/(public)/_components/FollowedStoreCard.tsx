import Link from "next/link";

import DefaultImage from "@/assets/DefaultImage.svg";
import { formatThousand } from "@/lib/format";
import type { FollowedStore } from "@/types/store";

type FollowedStoreCardProps = {
  store: FollowedStore;
};

export function FollowedStoreCard({ store }: FollowedStoreCardProps) {
  return (
    <li className="flex w-full flex-col gap-12">
      {/* 사진과 이름 전체가 스토어로 가는 하나의 링크다. */}
      <Link
        href={`/shop/${store.sellerId}`}
        className="flex w-full items-center gap-8"
      >
        <div className="border-stroke-neutral-weak bg-bg-neutral-weak size-[3rem] shrink-0 overflow-hidden rounded-full border">
          {store.shopImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.shopImageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <DefaultImage className="size-full" />
          )}
        </div>
        <p className="text-l4-semibold text-fg-neutral-solid min-w-0 flex-1 truncate">
          {store.shopName}
        </p>
      </Link>

      {/* 상품은 최대 3개가 한 줄에 들어간다. 적게 와도 칸 너비는 3분할로 고정한다. */}
      <ul className="grid w-full grid-cols-3 gap-12">
        {store.products.map((product) => (
          <li key={product.productId}>
            <Link
              href={`/shop/${store.sellerId}/${product.productId}`}
              className="flex w-full flex-col gap-12"
            >
              <div className="rounded-8 bg-bg-neutral-weak aspect-square w-full overflow-hidden">
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
                <p className="text-l5-regular text-fg-neutral-solid w-full truncate">
                  {product.name}
                </p>
                <p className="text-l5-semibold text-fg-neutral-solid w-full truncate">
                  {formatThousand(product.price)}원
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function FollowedStoreCardSkeleton() {
  return (
    <li className="flex w-full flex-col gap-12">
      <div className="flex w-full items-center gap-8">
        <div className="bg-bg-neutral-weak size-[3rem] shrink-0 animate-pulse rounded-full" />
        <div className="bg-bg-neutral-weak rounded-4 h-[1.3rem] w-1/3 animate-pulse" />
      </div>
      <ul className="grid w-full grid-cols-3 gap-12">
        {[0, 1, 2].map((column) => (
          <li key={column} className="flex w-full flex-col gap-12">
            <div className="rounded-8 bg-bg-neutral-weak aspect-square w-full animate-pulse" />
            <div className="flex w-full flex-col gap-8 px-2">
              <div className="bg-bg-neutral-weak rounded-4 h-12 w-full animate-pulse" />
              <div className="bg-bg-neutral-weak rounded-4 h-12 w-3/5 animate-pulse" />
            </div>
          </li>
        ))}
      </ul>
    </li>
  );
}
