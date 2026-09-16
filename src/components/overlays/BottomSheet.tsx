"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { APP_FRAME_ID } from "./app-frame";

// 이만큼 아래로 끌고 놓으면 닫는다.
const CLOSE_DISTANCE_PX = 80;

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** 디자인에 제목이 없는 시트용. 이름은 남겨 두고 화면에서만 감춘다. */
  hideTitle?: boolean;
  children: ReactNode;
};

/**
 * 앱 프레임 아래쪽에서 올라오는 시트.
 * 화면 전체가 아니라 모바일 프레임만 덮어야 하고, 본문이 스크롤돼도 제자리에
 * 있어야 하므로 스크롤되지 않는 프레임(app/layout.tsx)으로 포털해 붙인다.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  hideTitle = false,
  children,
}: BottomSheetProps) {
  const titleId = useId();
  // 아래로 끈 거리. 놓았을 때 이만큼 넘었으면 닫는다.
  const [dragged, setDragged] = useState(0);
  const dragFrom = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragFrom.current = event.clientY;
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragFrom.current === null) return;
    // 위로 끄는 것은 따라가지 않는다. 시트는 아래로만 닫힌다.
    setDragged(Math.max(0, event.clientY - dragFrom.current));
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragFrom.current = null;

    if (dragged >= CLOSE_DISTANCE_PX) {
      onClose();
    }
    // 덜 끌었으면 제자리로 돌아간다. 닫힐 때도 다음에 열릴 자리를 되돌려 둔다.
    setDragged(0);
  };

  // open 은 사용자가 눌러야 켜지므로, 이 시점의 프레임은 이미 그려져 있다.
  const frame = open ? document.getElementById(APP_FRAME_ID) : null;
  if (!frame) return null;

  return createPortal(
    <div
      className="bg-bg-overlay absolute inset-0 z-10 flex flex-col justify-end"
      // 바깥 여백을 누르면 닫힌다. 시트 안쪽 클릭은 아래에서 멈춰 세운다.
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        style={{ transform: `translateY(${dragged}px)` }}
        className="bg-bg-layer-default rounded-t-20 scrollbar-hidden relative flex max-h-[min(68rem,100%)] w-full flex-col items-center gap-24 overflow-y-auto overscroll-contain px-20 pt-32 pb-20"
      >
        {/* 손잡이가 있는 윗부분을 아래로 끌면 닫힌다. */}
        <div
          aria-hidden
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="absolute inset-x-0 top-0 z-10 flex h-32 touch-none justify-center pt-8"
        >
          <span className="bg-fg-neutral-disabled h-4 w-[4.4rem] rounded-full" />
        </div>

        <h2
          id={titleId}
          className={
            hideTitle
              ? "sr-only"
              : "text-t3-bold text-fg-neutral-solid w-full text-center"
          }
        >
          {title}
        </h2>

        {children}
      </div>
    </div>,
    frame,
  );
}
