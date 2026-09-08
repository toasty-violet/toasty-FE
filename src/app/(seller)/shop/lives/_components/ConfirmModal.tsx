"use client";

import { useId, useRef, type ReactNode } from "react";

import { useModalDismiss } from "@/hooks/use-modal-dismiss";

/** 되돌리기 어려운 동작을 누르기 전에 한 번 묻는 모달. 버튼은 쓰는 쪽이 채운다. */
export function ConfirmModal({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useModalDismiss(dialogRef, onClose);

  return (
    <div
      className="bg-bg-overlay fixed inset-0 z-50 flex items-center justify-center px-[4.5rem]"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        // 모달 안을 눌렀을 때 바깥 클릭으로 닫히지 않게 한다.
        onClick={(event) => event.stopPropagation()}
        className="bg-bg-layer-default rounded-20 flex w-full max-w-[30rem] flex-col gap-24 px-20 pt-32 pb-20"
      >
        <div className="flex flex-col items-center gap-8 text-center">
          <h2 id={titleId} className="text-t3-bold text-fg-neutral-solid">
            {title}
          </h2>
          {description && (
            <p className="text-l5-medium text-fg-neutral-secondary">
              {description}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
