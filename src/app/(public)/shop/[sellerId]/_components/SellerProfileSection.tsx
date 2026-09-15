"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/buttons/Button";
import {
  StoreProfileCard,
  StoreProfileCardError,
  StoreProfileCardSkeleton,
} from "@/components/cards/StoreProfileCard";
import { followStore, getSellerProfile, unfollowStore } from "@/lib/store-api";
import { useAuthStore } from "@/store/auth-store";
import type { SellerProfile } from "@/types/store";

export function SellerProfileSection({ sellerId }: { sellerId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authStatus = useAuthStore((state) => state.status);
  const profileKey = ["seller-profile", sellerId];

  const {
    data: profile,
    isPending,
    isError,
  } = useQuery({
    queryKey: profileKey,
    queryFn: () => getSellerProfile(sellerId),
  });

  const toggleFollow = useMutation({
    mutationFn: (following: boolean) =>
      following ? unfollowStore(sellerId) : followStore(sellerId),
    // 응답이 ok 뿐이라 서버를 다시 조회하지 않고 카드의 값을 직접 뒤집는다.
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

  if (isPending) {
    return <StoreProfileCardSkeleton />;
  }

  if (isError) {
    return <StoreProfileCardError />;
  }

  return (
    <StoreProfileCard
      sellerId={profile.sellerId}
      shopImageUrl={profile.shopImageUrl}
      shopName={profile.shopName}
      followerCount={profile.followerCount}
      productCount={profile.productCount}
      description={profile.description}
      action={
        <Button
          label={profile.following ? "팔로잉" : "팔로우"}
          variant={profile.following ? "outlined" : "solid"}
          color={profile.following ? "assistive" : "secondary"}
          size="sm"
          fullWidth
          onClick={() => handleToggleFollow(profile.following)}
        />
      }
    />
  );
}
