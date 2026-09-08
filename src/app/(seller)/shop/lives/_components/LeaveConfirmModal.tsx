"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/buttons/Button";

export function LeaveConfirmModal({
  canSave,
  onDiscard,
  onSave,
  onClose,
}: {
  canSave: boolean;
  onDiscard: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

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
  }, [onClose]);

  return (
    <div
      className="bg-bg-overlay fixed inset-0 z-50 flex items-center justify-center px-[4.5rem]"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-confirm-title"
        // 모달 안을 눌렀을 때 바깥 클릭으로 닫히지 않게 한다.
        onClick={(event) => event.stopPropagation()}
        className="bg-bg-layer-default rounded-20 flex w-full max-w-[30rem] flex-col gap-24 px-20 pt-32 pb-20"
      >
        <h2
          id="leave-confirm-title"
          className="text-t3-bold text-fg-neutral-solid text-center"
        >
          설정중인 라이브를 저장할까요?
        </h2>

        <div className="flex w-full gap-10">
          <div className="flex-1">
            <Button
              label="저장 안 함"
              variant="outlined"
              color="assistive"
              size="md"
              fullWidth
              onClick={onDiscard}
            />
          </div>
          <div className="flex-1">
            <Button
              label="저장하기"
              size="md"
              fullWidth
              disabled={!canSave}
              onClick={onSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
