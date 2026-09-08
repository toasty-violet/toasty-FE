"use client";

import { Button } from "@/components/buttons/Button";

import { ConfirmModal } from "./ConfirmModal";

export function DeleteLiveModal({
  deleting,
  error,
  onDelete,
  onClose,
}: {
  deleting: boolean;
  error: string | null;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <ConfirmModal
      title="방송을 삭제할까요?"
      description="삭제한 방송은 되돌릴 수 없어요."
      onClose={onClose}
    >
      {error && (
        <p role="alert" className="text-c1-medium text-fg-critical text-center">
          {error}
        </p>
      )}

      <div className="flex w-full gap-10">
        <div className="flex-1">
          <Button
            label="취소"
            variant="outlined"
            color="assistive"
            size="md"
            fullWidth
            onClick={onClose}
          />
        </div>
        <div className="flex-1">
          <Button
            label={deleting ? "삭제하는 중…" : "삭제"}
            color="critical"
            size="md"
            fullWidth
            disabled={deleting}
            onClick={onDelete}
          />
        </div>
      </div>
    </ConfirmModal>
  );
}
