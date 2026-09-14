"use client";

import { useQuery } from "@tanstack/react-query";

import { getFollowedStores } from "@/lib/store-api";
import { useAuthStore } from "@/store/auth-store";

import {
  FollowedStoreCard,
  FollowedStoreCardSkeleton,
} from "./FollowedStoreCard";

const EMPTY_MESSAGE = "팔로우하는 스토어가 없습니다.";

export function FollowedStoreSection() {
  const authStatus = useAuthStore((state) => state.status);

  // 로그인한 사람만 부를 수 있는 목록이라, 인증이 확정되기 전에는 요청하지 않는다.
  const { data, isPending, error } = useQuery({
    queryKey: ["stores", "following"],
    queryFn: getFollowedStores,
    enabled: authStatus === "authed",
  });

  if (authStatus === "guest" || error) {
    return (
      <p className="text-l5-regular text-fg-neutral-secondary">
        {EMPTY_MESSAGE}
      </p>
    );
  }

  if (authStatus === "loading" || isPending) {
    return (
      <ul className="flex w-full flex-col gap-24">
        <FollowedStoreCardSkeleton />
      </ul>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-l5-regular text-fg-neutral-secondary">
        {EMPTY_MESSAGE}
      </p>
    );
  }

  return (
    <ul className="flex w-full flex-col gap-24">
      {data.map((store) => (
        <FollowedStoreCard key={store.sellerId} store={store} />
      ))}
    </ul>
  );
}
