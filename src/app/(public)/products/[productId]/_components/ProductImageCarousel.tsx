"use client";

import { useState } from "react";
import Image from "next/image";

import DefaultImage from "@/assets/DefaultImage.svg";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const BADGE_BG = "#1a1c2099"; // bg/overlay-muted
const BADGE_TOTAL = "#ffffff99"; // fg/neutral-inverse-muted

/** 상품 사진을 한 장씩 넘겨 본다. 오른쪽 아래에 지금 몇 번째인지 띄운다. */
export function ProductImageCarousel({ imageUrls }: { imageUrls: string[] }) {
  const [current, setCurrent] = useState(0);

  if (imageUrls.length === 0) {
    return (
      <div className="bg-bg-neutral-weak h-[48.7rem] w-full shrink-0">
        <DefaultImage className="size-full" />
      </div>
    );
  }

  return (
    <div className="relative h-[48.7rem] w-full shrink-0">
      <ul
        // 한 장이 화면 폭을 꽉 채우므로, 넘긴 거리로 몇 번째인지 셀 수 있다.
        onScroll={(event) => {
          const list = event.currentTarget;
          setCurrent(Math.round(list.scrollLeft / list.clientWidth));
        }}
        className="scrollbar-hidden flex size-full snap-x snap-mandatory overflow-x-auto"
      >
        {imageUrls.map((imageUrl, index) => (
          <li key={imageUrl} className="relative size-full shrink-0 snap-start">
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="100vw"
              // 첫 장은 화면을 열자마자 보이는 자리라 먼저 받는다.
              priority={index === 0}
              className="object-cover"
            />
          </li>
        ))}
      </ul>

      {imageUrls.length > 1 && (
        <p
          className="text-l5-medium text-fg-neutral-inverted rounded-12 absolute right-20 bottom-20 flex items-center gap-2 px-10 py-4"
          style={{ backgroundColor: BADGE_BG }}
        >
          {current + 1}
          <span style={{ color: BADGE_TOTAL }}>/ {imageUrls.length}</span>
        </p>
      )}
    </div>
  );
}
