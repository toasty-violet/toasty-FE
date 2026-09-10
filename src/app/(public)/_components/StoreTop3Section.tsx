"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { followStore, getTopStores, unfollowStore } from "@/lib/store-api";
import { useAuthStore } from "@/store/auth-store";
import type { TopStore } from "@/types/store";

import { StoreTop3Item, StoreTop3ItemSkeleton } from "./StoreTop3Item";

const TOP_STORES_KEY = ["stores", "top"];

// 스토어가 3개보다 적으면 받은 만큼만 그린다. 스켈레톤은 자리를 잡아야 하므로 3줄로 둔다.
const SKELETON_ROWS = [0, 1, 2];

export function StoreTop3Section() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const { data, isPending, error } = useQuery({
    queryKey: TOP_STORES_KEY,
    queryFn: getTopStores,
  });

  const toggleFollow = useMutation({
    mutationFn: ({ sellerId, following }: TopStore) =>
      following ? unfollowStore(sellerId) : followStore(sellerId),
    // 응답이 ok 뿐이라 서버를 다시 조회하지 않고 목록을 직접 뒤집는다.
    onMutate: async ({ sellerId, following }: TopStore) => {
      await queryClient.cancelQueries({ queryKey: TOP_STORES_KEY });
      const previous = queryClient.getQueryData<TopStore[]>(TOP_STORES_KEY);

      queryClient.setQueryData<TopStore[]>(TOP_STORES_KEY, (stores) =>
        stores?.map((store) =>
          store.sellerId === sellerId
            ? {
                ...store,
                following: !following,
                followerCount: store.followerCount + (following ? -1 : 1),
              }
            : store,
        ),
      );

      return { previous };
    },
    // 실패하면 누르기 전 목록으로 되돌린다.
    onError: (_error, _store, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TOP_STORES_KEY, context.previous);
      }
    },
  });

  const handleToggleFollow = (store: TopStore) => {
    // 비로그인 상태에서는 요청을 보내지 않고 로그인부터 시킨다.
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    toggleFollow.mutate(store);
  };

  // 제목은 페이지가 서버에서 그리므로, 여기서는 목록만 비운다.
  if (error || (data && data.length === 0)) {
    return null;
  }

  return (
    <ul className="flex w-full flex-col gap-24">
      {isPending
        ? SKELETON_ROWS.map((row) => <StoreTop3ItemSkeleton key={row} />)
        : data.map((store) => (
            <StoreTop3Item
              key={store.sellerId}
              store={store}
              onToggleFollow={handleToggleFollow}
            />
          ))}
    </ul>
  );
}
