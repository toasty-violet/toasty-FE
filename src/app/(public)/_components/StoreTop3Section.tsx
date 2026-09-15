"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { followStore, getTopStores, unfollowStore } from "@/lib/store-api";
import { type AuthStatus, useAuthStore } from "@/store/auth-store";
import type { TopStore } from "@/types/store";

import { StoreTop3Item, StoreTop3ItemSkeleton } from "./StoreTop3Item";

// /stores/top 은 인증 없이도 200 으로 오고 그때 following 이 모두 false 라, 부팅 중에 조회하면
// 401 재발급 경로를 타지 않아 비로그인 응답이 그대로 캐시에 남는다. 인증 상태를 키에 넣어
// 로그인이 확정되면 다시 조회하고, 로그아웃하면 이전 팔로우 상태를 물려받지 않게 한다.
const topStoresKey = (authStatus: AuthStatus) => ["stores", "top", authStatus];

// 스토어가 3개보다 적으면 받은 만큼만 그린다. 스켈레톤은 자리를 잡아야 하므로 3줄로 둔다.
const SKELETON_ROWS = [0, 1, 2];

export function StoreTop3Section() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authStatus = useAuthStore((state) => state.status);
  const queryKey = topStoresKey(authStatus);

  const { data, isPending, error } = useQuery({
    queryKey,
    queryFn: getTopStores,
  });

  const toggleFollow = useMutation({
    mutationFn: ({ sellerId, following }: TopStore) =>
      following ? unfollowStore(sellerId) : followStore(sellerId),
    // 응답이 ok 뿐이라 서버를 다시 조회하지 않고 목록을 직접 뒤집는다.
    onMutate: async ({ sellerId, following }: TopStore) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<TopStore[]>(queryKey);

      queryClient.setQueryData<TopStore[]>(queryKey, (stores) =>
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
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
  });

  const handleToggleFollow = (store: TopStore) => {
    // 목록은 조회 한 번이면 뜨지만 인증은 refresh → role 두 번이라, 부팅이 끝나기 전에
    // 눌릴 수 있다. 로그인 여부가 확정되기 전에는 로그인으로 보내지 않고 아무것도 하지 않는다.
    if (authStatus === "loading") {
      return;
    }
    // 비로그인이 확정된 경우에만 요청을 보내지 않고 로그인부터 시킨다.
    if (authStatus === "guest") {
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
