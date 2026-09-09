"use client";

import { useId } from "react";

import { Button } from "@/components/buttons/Button";

import { Modal } from "./Modal";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  /** 제목 아래 보조 설명. 없으면 제목만 보여준다. */
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** 되돌릴 수 없는 동작은 critical 로 확인 버튼을 빨갛게 둔다. */
  tone?: "critical" | "primary";
  /** 요청이 끝나기 전 중복 확인을 막는다. */
  confirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** 예/아니오를 묻는 확인 창. 껍데기는 Modal 이 맡는다. */
export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "취소",
  tone = "primary",
  confirming = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      describedBy={description ? descriptionId : undefined}
    >
      <div className="flex w-full flex-col gap-8 text-center">
        <h2 id={titleId} className="text-t3-bold text-fg-neutral-solid w-full">
          {title}
        </h2>
        {description && (
          <p
            id={descriptionId}
            className="text-b3-regular text-fg-neutral-primary w-full"
          >
            {description}
          </p>
        )}
      </div>

      <div className="flex w-full gap-10">
        <div className="flex-1">
          <Button
            label={cancelLabel}
            variant="outlined"
            color="assistive"
            size="md"
            fullWidth
            onClick={onClose}
          />
        </div>
        <div className="flex-1">
          <Button
            label={confirmLabel}
            color={tone}
            size="md"
            fullWidth
            disabled={confirming}
            onClick={onConfirm}
          />
        </div>
      </div>
    </Modal>
  );
}
