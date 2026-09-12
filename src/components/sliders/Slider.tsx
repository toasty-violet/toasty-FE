"use client";

import { useRef, useState } from "react";

type SliderProps = {
  /** 가로로 나열할 항목들. 각 항목이 한 장의 슬라이드가 된다. */
  children: React.ReactNode;
  /** 슬라이드 사이 간격. 토큰 spacing 값(px 기준)을 받는다. */
  gap?: number;
  /**
   * 좌우 여백. 부모가 이미 좌우 패딩을 가진 경우, 그 값을 넘기면
   * 음수 마진으로 패딩을 상쇄해 슬라이드가 화면 끝까지 흐르게 한다.
   */
  edgePadding?: number;
  "aria-label"?: string;
};

/** 이만큼 끌어야 클릭이 아니라 드래그로 본다. */
const DRAG_THRESHOLD = 5;

/**
 * 자식 요소를 가로로 스크롤하는 슬라이더.
 * 터치·휠 스크롤에 더해, 마우스로 끌어서도 넘길 수 있다.
 */
export function Slider({
  children,
  gap = 12,
  edgePadding = 0,
  "aria-label": ariaLabel,
}: SliderProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const origin = useRef({ x: 0, scrollLeft: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // 터치는 브라우저 기본 스크롤이 이미 자연스러워서 마우스만 직접 처리한다.
  const handlePointerDown = (event: React.PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== "mouse") return;

    const list = listRef.current;
    if (!list) return;

    origin.current = { x: event.clientX, scrollLeft: list.scrollLeft };
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLUListElement>) => {
    if (!isDragging) return;

    const list = listRef.current;
    if (!list) return;

    const distance = event.clientX - origin.current.x;

    // threshold 를 넘는 순간부터 포인터를 붙잡아, 커서가 슬라이더를 벗어나도
    // 드래그가 이어지고 카드 안의 링크·버튼이 클릭으로 오해받지 않게 한다.
    if (
      !list.hasPointerCapture(event.pointerId) &&
      Math.abs(distance) > DRAG_THRESHOLD
    ) {
      list.setPointerCapture(event.pointerId);
    }

    if (list.hasPointerCapture(event.pointerId)) {
      list.scrollLeft = origin.current.scrollLeft - distance;
    }
  };

  const endDrag = (event: React.PointerEvent<HTMLUListElement>) => {
    const list = listRef.current;
    if (list?.hasPointerCapture(event.pointerId)) {
      list.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  return (
    <ul
      ref={listRef}
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      // 이미지는 기본적으로 끌 수 있어서, 그대로 두면 브라우저의 이미지 드래그가
      // 포인터를 가져가 버리고 슬라이드가 넘어가지 않는다.
      onDragStart={(event) => event.preventDefault()}
      // 드래그 중에는 스냅이 끌림을 되돌려 버려서 잠시 꺼둔다.
      className={`scrollbar-hidden flex overflow-x-auto ${
        isDragging ? "cursor-grabbing select-none" : "snap-x snap-mandatory"
      }`}
      style={{
        gap: `${gap / 10}rem`,
        marginInline: `-${edgePadding / 10}rem`,
        paddingInline: `${edgePadding / 10}rem`,
        // 이게 없으면 스냅이 첫 장을 패딩 안쪽까지 끌어당겨, 맨 처음 화면에서
        // 첫 장만 제목보다 왼쪽으로 튀어나온다.
        scrollPaddingInline: `${edgePadding / 10}rem`,
      }}
    >
      {children}
    </ul>
  );
}

/** 슬라이더 안의 한 장. 스냅 지점이자 자체 크기를 유지하는 단위다. */
export function SliderItem({ children }: { children: React.ReactNode }) {
  return <li className="shrink-0 snap-start">{children}</li>;
}
