"use client";

import { useEffect, type RefObject } from "react";

/**
 * 모달이 열려 있는 동안 Esc 로 닫고, Tab 포커스를 모달 안에 가둔다.
 * 닫히면 모달을 연 자리로 포커스를 돌려준다.
 */
export function useModalDismiss(
  dialogRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () => [
      ...(dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled])",
      ) ?? []),
    ];

    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
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

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [dialogRef, onClose]);
}
