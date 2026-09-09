"use client";

import Image from "next/image";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
// fg/neutral-inverse-muted
const MUTED = "#ffffff73";

/** 방송 화면 위에 얹히는 상단 바. 비디오가 비쳐 보이도록 그라데이션만 깐다. */
export function LiveHeader({
  title,
  shopImageUrl,
  viewerCount,
  onEnd,
  ending,
}: {
  title: string;
  shopImageUrl: string;
  /** 아직 못 받았으면 undefined. 자리를 지키려고 "-" 로 둔다. */
  viewerCount?: number;
  onEnd: () => void;
  ending: boolean;
}) {
  return (
    <header className="flex w-full items-center gap-12 bg-gradient-to-b from-[#1a1c204d] from-20% to-transparent px-20 pt-12 pb-24">
      <div className="flex min-w-0 flex-1 items-center gap-8">
        <span className="bg-bg-neutral-weak relative size-32 shrink-0 overflow-hidden rounded-full border border-gray-300">
          {shopImageUrl && (
            <Image
              src={shopImageUrl}
              alt=""
              fill
              sizes="32px"
              unoptimized
              className="object-cover"
            />
          )}
        </span>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
          <p className="text-l3-semibold text-fg-neutral-inverted truncate">
            {title}
          </p>
          <div className="flex items-center gap-4" style={{ color: MUTED }}>
            <span className="text-l6-medium">
              {viewerCount === undefined ? "-" : viewerCount}명 시청중
            </span>
            <span className="text-l7-medium">∙</span>
            {/* 판매율은 주문 집계가 생기면 서버가 준다. */}
            <span className="text-l7-medium">판매율 -%</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onEnd}
        disabled={ending}
        className="rounded-8 text-l5-semibold bg-bg-neutral-solid text-fg-neutral-inverted flex h-32 shrink-0 items-center justify-center px-12 disabled:opacity-60"
      >
        {ending ? "종료 중…" : "방송종료"}
      </button>
    </header>
  );
}
