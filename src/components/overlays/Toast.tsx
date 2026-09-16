"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { APP_FRAME_ID } from "./app-frame";

// 읽고 사라질 만큼만 띄운다.
const VISIBLE_MS = 2000;

/**
 * 화면 아래에 잠깐 떴다 사라지는 안내.
 * 눌러서 없앨 것이 아니라서 앱 프레임 위에 얹고 손대지 못하게 둔다.
 */
export function Toast({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const hide = window.setTimeout(onClose, VISIBLE_MS);
    return () => window.clearTimeout(hide);
  }, [open, onClose]);

  const frame = open ? document.getElementById(APP_FRAME_ID) : null;
  if (!frame) return null;

  return createPortal(
    <p
      role="status"
      className="bg-bg-neutral-solid text-l5-medium text-fg-neutral-inverted pointer-events-none absolute inset-x-0 bottom-[8.8rem] z-20 mx-auto flex w-fit items-center gap-8 rounded-full px-16 py-8"
    >
      {children}
    </p>,
    frame,
  );
}
