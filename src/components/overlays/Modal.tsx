"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { APP_FRAME_ID } from "./app-frame";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** 제목 요소의 id. 읽는 사람에게 무엇을 묻는 창인지 알린다. */
  labelledBy?: string;
  describedBy?: string;
  children: ReactNode;
};

/**
 * 화면 가운데 띄우는 모달 껍데기.
 * 딤 처리와 포커스 가둠, Escape 닫기까지만 맡고 내용은 쓰는 쪽이 채운다.
 * BottomSheet 와 같은 이유로 화면 전체가 아니라 앱 프레임만 덮도록 포털로 붙인다.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  describedBy,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement as HTMLElement | null;
    const focusables = () => [
      ...(dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled])",
      ) ?? []),
    ];

    focusables()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      // 모달 밖으로 포커스가 새지 않게 양 끝을 이어 붙인다.
      const items = focusables();
      if (items.length === 0) return;
      const edge = event.shiftKey ? items[0] : items[items.length - 1];
      if (document.activeElement === edge) {
        event.preventDefault();
        (event.shiftKey ? items[items.length - 1] : items[0]).focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      opener?.focus();
    };
  }, [open, onClose]);

  // open 은 사용자가 눌러야 켜지므로, 이 시점의 프레임은 이미 그려져 있다.
  const frame = open ? document.getElementById(APP_FRAME_ID) : null;
  if (!frame) return null;

  return createPortal(
    <div
      className="bg-bg-overlay absolute inset-0 z-10 flex items-center justify-center px-20"
      // 바깥 여백을 누르면 닫힌다. 모달 안쪽 클릭은 아래에서 멈춰 세운다.
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        onClick={(event) => event.stopPropagation()}
        className="bg-bg-layer-default rounded-20 flex w-full max-w-[30rem] flex-col items-center gap-24 px-20 pt-32 pb-20"
      >
        {children}
      </div>
    </div>,
    frame,
  );
}
