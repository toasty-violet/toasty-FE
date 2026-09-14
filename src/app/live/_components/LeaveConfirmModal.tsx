"use client";

import { useId } from "react";

import { Button } from "@/components/buttons/Button";
import { Modal } from "@/components/overlays/Modal";

/**
 * 작성 중인 내용을 두고 나가려 할 때 묻는다.
 * 저장 안 함과 그냥 닫기가 다른 결과라 ConfirmModal 대신 Modal 위에 직접 그린다.
 */
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
  const titleId = useId();

  return (
    <Modal open onClose={onClose} labelledBy={titleId}>
      <h2
        id={titleId}
        className="text-t3-bold text-fg-neutral-solid w-full text-center"
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
    </Modal>
  );
}
