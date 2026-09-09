"use client";

import Image from "next/image";
import type { ReactNode } from "react";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
// fg/neutral-inverse-muted
const MUTED = "#ffffff73";

/**
 * 라이브 화면 위에 얹히는 상단 바. 셀러 송출과 구매자 시청이 함께 쓴다.
 * 비디오가 비쳐 보이도록 그라데이션만 깐다.
 */
export function LiveHeader({
  title,
  shopImageUrl,
  subtitle,
  action,
}: {
  title: string;
  shopImageUrl: string;
  /** 제목 아래 한 줄. 화면마다 담는 내용이 다르다. */
  subtitle: ReactNode;
  /** 오른쪽 버튼. 셀러는 방송종료, 구매자는 닫기다. */
  action: ReactNode;
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
          <h1 className="text-l3-semibold text-fg-neutral-inverted truncate">
            {title}
          </h1>
          <div
            className="flex items-center gap-4 truncate"
            style={{ color: MUTED }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      {action}
    </header>
  );
}

/** 시청자 수는 아직 못 받았으면 자리를 지키려고 "-" 로 둔다. */
export function viewerLabel(viewerCount?: number) {
  return `${viewerCount ?? "-"}명 시청중`;
}
