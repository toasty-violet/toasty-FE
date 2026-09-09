"use client";

import { useRouter } from "next/navigation";

import LinkIcon from "@/assets/Link.svg";
import { Button } from "@/components/buttons/Button";

// API 명세가 나오기 전이라 디자인 값을 그대로 둔다.
const STORE = {
  name: "토스티샵",
  followerCount: 240,
  productCount: 38,
  description: "예쁜 빈티지 옷들 모아두는 중 🧺\n매주 금요일 저녁 8시 LIVE",
};

export function StoreProfileCard() {
  const router = useRouter();

  return (
    <section className="bg-bg-layer-default rounded-12 flex w-full flex-col items-center justify-center gap-16 p-16">
      <div className="flex w-full items-center gap-12">
        <div className="border-stroke-neutral-weak bg-bg-neutral-weak size-48 shrink-0 overflow-hidden rounded-full border" />

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <h2 className="text-st1-semibold text-fg-neutral-solid w-full truncate">
            {STORE.name}
          </h2>
          <p className="text-l6-regular text-fg-neutral-secondary w-full truncate">
            팔로워 {STORE.followerCount} · 상품 {STORE.productCount}
          </p>
        </div>
      </div>

      {/* 소개는 줄바꿈을 그대로 살린다. */}
      <p className="text-b5-reading-regular text-fg-neutral-strong w-full whitespace-pre-line">
        {STORE.description}
      </p>

      <div className="flex w-full items-center justify-center gap-8">
        <Button
          label="스토어 정보 수정"
          color="assistive"
          size="sm"
          fullWidth
          onClick={() => router.push("/shop/edit")}
        />
        <button
          type="button"
          aria-label="스토어 링크 복사"
          className="bg-bg-neutral-weak rounded-8 flex size-36 shrink-0 items-center justify-center"
        >
          <LinkIcon className="text-fg-neutral-primary size-18 [&_path]:fill-current" />
        </button>
      </div>
    </section>
  );
}
