"use client";

import { useEffect, useId, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { APP_FRAME_ID } from "./app-frame";

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

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

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
        className="bg-bg-layer-default rounded-t-20 relative flex max-h-full w-full flex-col items-center gap-24 overflow-y-auto px-20 pt-32 pb-20"
      >
        <span className="bg-fg-neutral-disabled absolute top-8 h-4 w-[4.4rem] rounded-full" />

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
