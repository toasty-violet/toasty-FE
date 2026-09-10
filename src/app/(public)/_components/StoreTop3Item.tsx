"use client";

import ShopImageDefault from "@/assets/ShopImageDefault.svg";
import { Button } from "@/components/buttons/Button";
import { formatThousand } from "@/lib/format";
import type { TopStore } from "@/types/store";

type StoreTop3ItemProps = {
  store: TopStore;
  onToggleFollow: (store: TopStore) => void;
};

export function StoreTop3Item({ store, onToggleFollow }: StoreTop3ItemProps) {
  return (
    <li className="flex w-full items-center gap-12">
      <div className="border-stroke-neutral-weak bg-bg-neutral-weak size-48 shrink-0 overflow-hidden rounded-full border">
        {/* 사진을 등록하지 않은 스토어는 기본 이미지로 채운다. */}
        {store.shopImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.shopImageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <ShopImageDefault className="size-full" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <p className="text-st1-semibold text-fg-neutral-solid w-full truncate">
          {store.shopName}
        </p>
        <p className="text-l6-regular text-fg-neutral-secondary w-full truncate">
          팔로워 {formatThousand(store.followerCount)} · 상품{" "}
          {formatThousand(store.productCount)}
        </p>
      </div>

      <Button
        label={store.following ? "팔로잉" : "팔로우"}
        variant={store.following ? "outlined" : "solid"}
        color={store.following ? "assistive" : "secondary"}
        size="xs"
        onClick={() => onToggleFollow(store)}
      />
    </li>
  );
}

export function StoreTop3ItemSkeleton() {
  return (
    <li className="flex w-full items-center gap-12">
      <div className="bg-bg-neutral-weak size-48 shrink-0 animate-pulse rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="bg-bg-neutral-weak rounded-4 h-16 w-2/5 animate-pulse" />
        <div className="bg-bg-neutral-weak rounded-4 h-11 w-3/5 animate-pulse" />
      </div>
      <div className="bg-bg-neutral-weak rounded-8 h-32 w-64 shrink-0 animate-pulse" />
    </li>
  );
}
