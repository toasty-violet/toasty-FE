"use client";

import { Button } from "@/components/buttons/Button";

import { ConfirmModal } from "./ConfirmModal";

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
  return (
    <ConfirmModal title="설정중인 라이브를 저장할까요?" onClose={onClose}>
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
    </ConfirmModal>
  );
}
