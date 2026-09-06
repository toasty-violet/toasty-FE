"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  return (
    <div
      className="bg-bg-overlay fixed inset-0 z-50 flex items-center justify-center px-[4.5rem]"
      onClick={onClose}
    >
      <div
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
          <Button
            label="저장 안 함"
            variant="outlined"
            color="assistive"
            size="md"
            className="flex-1"
            onClick={onDiscard}
          />
          <Button
            label="저장하기"
            size="md"
            className="flex-1"
            disabled={!canSave}
            onClick={onSave}
          />
        </div>
      </div>
    </div>
  );
}
