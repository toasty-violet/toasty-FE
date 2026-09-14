"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Slider, SliderItem } from "@/components/sliders/Slider";
import { getPublicLives } from "@/app/live/_lib/live-api";
import { followStore, unfollowStore } from "@/lib/store-api";
import { useAuthStore } from "@/store/auth-store";
import type { PublicLive } from "@/types/live";

import { LiveNowCard, LiveNowCardSkeleton } from "./LiveNowCard";

const PUBLIC_LIVES_KEY = ["lives", "public"];

// 라이브가 몇 개 올지 모르지만, 스켈레톤은 자리를 잡아야 하므로 두 장으로 둔다.
const SKELETON_CARDS = [0, 1];

export function LiveNowSection() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const authStatus = useAuthStore((state) => state.status);

  const { data, isPending, error } = useQuery({
    queryKey: PUBLIC_LIVES_KEY,
    queryFn: getPublicLives,
  });

  const toggleFollow = useMutation({
    mutationFn: ({ seller, following }: PublicLive) =>
      following ? unfollowStore(seller.sellerId) : followStore(seller.sellerId),
    // 응답이 ok 뿐이라 서버를 다시 조회하지 않고 목록을 직접 뒤집는다.
    // 같은 셀러가 여러 라이브를 걸 수 있어 sellerId 가 같은 카드를 모두 바꾼다.
    onMutate: async ({ seller, following }: PublicLive) => {
      await queryClient.cancelQueries({ queryKey: PUBLIC_LIVES_KEY });
      const previous = queryClient.getQueryData<PublicLive[]>(PUBLIC_LIVES_KEY);

      queryClient.setQueryData<PublicLive[]>(PUBLIC_LIVES_KEY, (lives) =>
        lives?.map((live) =>
          live.seller.sellerId === seller.sellerId
            ? { ...live, following: !following }
            : live,
        ),
      );

      return { previous };
    },
    // 실패하면 누르기 전 목록으로 되돌린다.
    onError: (_error, _live, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PUBLIC_LIVES_KEY, context.previous);
      }
    },
  });

  const handleToggleFollow = (live: PublicLive) => {
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
    toggleFollow.mutate(live);
  };

  // 걸린 라이브가 없으면 제목까지 통째로 감춘다.
  if (error || (data && data.length === 0)) {
    return null;
  }

  return (
    <section className="flex w-full flex-col gap-14">
      <h2 className="text-t3-bold text-fg-neutral-solid w-full">
        지금 뜨는 라이브
      </h2>
      <Slider edgePadding={20} aria-label="지금 뜨는 라이브">
        {isPending
          ? SKELETON_CARDS.map((card) => (
              <SliderItem key={card}>
                <LiveNowCardSkeleton />
              </SliderItem>
            ))
          : data.map((live) => (
              <SliderItem key={live.publicId}>
                <LiveNowCard live={live} onToggleFollow={handleToggleFollow} />
              </SliderItem>
            ))}
      </Slider>
    </section>
  );
}
