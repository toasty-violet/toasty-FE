"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import DefaultImage from "@/assets/DefaultImage.svg";
import { Button } from "@/components/buttons/Button";
import { formatCountOrDash } from "@/lib/format";
import { followStore, getSellerProfile, unfollowStore } from "@/lib/store-api";
import { isRenderableImageSrc } from "@/lib/upload";
import { useAuthStore } from "@/store/auth-store";
import type { SellerProfile } from "@/types/store";

/** 상품을 파는 스토어 한 줄. 이름을 누르면 스토어로 가고, 여기서 바로 팔로우할 수 있다. */
export function ProductSellerRow({ sellerId }: { sellerId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authStatus = useAuthStore((state) => state.status);
  const profileKey = ["seller-profile", sellerId];

  const { data: profile } = useQuery({
    queryKey: profileKey,
    queryFn: () => getSellerProfile(sellerId),
  });

  const toggleFollow = useMutation({
    mutationFn: (following: boolean) =>
      following ? unfollowStore(sellerId) : followStore(sellerId),
    // 응답이 ok 뿐이라 서버를 다시 조회하지 않고 값을 직접 뒤집는다.
    onMutate: async (following: boolean) => {
      await queryClient.cancelQueries({ queryKey: profileKey });
      const previous = queryClient.getQueryData<SellerProfile>(profileKey);

      queryClient.setQueryData<SellerProfile>(profileKey, (store) =>
        store
          ? {
              ...store,
              following: !following,
              followerCount: store.followerCount + (following ? -1 : 1),
            }
          : store,
      );

      return { previous };
    },
    // 실패하면 누르기 전 값으로 되돌린다.
    onError: (_error, _following, context) => {
      if (context?.previous) {
        queryClient.setQueryData(profileKey, context.previous);
      }
    },
  });

  const handleToggleFollow = (following: boolean) => {
    // 스토어는 조회 한 번이면 뜨지만 인증은 refresh → role 두 번이라, 부팅이 끝나기 전에
    // 눌릴 수 있다. 로그인 여부가 확정되기 전에는 로그인으로 보내지 않고 아무것도 하지 않는다.
    if (authStatus === "loading") {
      return;
    }
    // 비로그인이 확정된 경우에만 요청을 보내지 않고 로그인부터 시킨다.
    if (authStatus === "guest") {
      router.push("/login");
      return;
    }
    toggleFollow.mutate(following);
  };

  // 스토어를 못 받으면 누를 곳이 없어 줄을 통째로 비운다.
  if (!profile) {
    return (
      <div aria-hidden className="flex w-full items-center gap-12">
        <div className="bg-bg-neutral-weak size-32 shrink-0 animate-pulse rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="bg-bg-neutral-weak rounded-4 h-13 w-2/5 animate-pulse" />
          <div className="bg-bg-neutral-weak rounded-4 h-11 w-3/5 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-12">
      <Link
        href={`/shop/${sellerId}`}
        className="flex min-w-0 flex-1 items-center gap-12"
      >
        <div className="border-stroke-neutral-weak bg-bg-neutral-weak relative size-32 shrink-0 overflow-hidden rounded-full border">
          {isRenderableImageSrc(profile.shopImageUrl) ? (
            <Image
              src={profile.shopImageUrl}
              alt=""
              fill
              sizes="32px"
              className="object-cover"
            />
          ) : (
            <DefaultImage className="size-full" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="text-l4-semibold text-fg-neutral-solid w-full truncate">
            {profile.shopName}
          </p>
          <p className="text-l6-regular text-fg-neutral-secondary w-full truncate">
            팔로워 {formatCountOrDash(profile.followerCount)} · 상품{" "}
            {formatCountOrDash(profile.productCount)}
          </p>
        </div>
      </Link>

      <Button
        label={profile.following ? "팔로잉" : "팔로우"}
        variant={profile.following ? "outlined" : "solid"}
        color={profile.following ? "assistive" : "secondary"}
        size="xs"
        onClick={() => handleToggleFollow(profile.following)}
      />
    </div>
  );
}
