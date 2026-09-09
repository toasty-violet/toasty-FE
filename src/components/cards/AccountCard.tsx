"use client";

import { useState } from "react";

import RightSmallIcon from "@/assets/RightSmall.svg";
import { ConfirmModal } from "@/components/overlays/ConfirmModal";
import { clearSession, deleteUser, logout } from "@/lib/auth";

function AccountRow({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between"
    >
      <span className="text-b3-medium text-fg-neutral-solid">{label}</span>
      <RightSmallIcon className="text-fg-neutral-icon size-24 shrink-0" />
    </button>
  );
}

export function AccountCard() {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  //서버 요청이 실패해도 클라이언트 세션은 비워야 로그아웃된 것으로 보인다.
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      clearSession();
      window.location.replace("/");
    }
  };

  //로그아웃과 달리 성공했을 때만 세션을 비운다.
  const handleDeleteUser = async () => {
    if (isDeleting) return;

    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteUser();
      clearSession();
      window.location.replace("/");
    } catch (error) {
      setIsDeleting(false);
      // 실패 사유는 카드에 남기므로 모달은 접는다.
      setIsConfirmOpen(false);
      setDeleteError(
        error instanceof Error
          ? error.message
          : "회원탈퇴에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    }
  };

  return (
    <section className="bg-bg-layer-default rounded-12 flex w-full flex-col gap-16 p-16">
      <AccountRow label="로그아웃" onClick={handleLogout} />
      <AccountRow label="회원탈퇴" onClick={() => setIsConfirmOpen(true)} />
      {deleteError && (
        <p role="alert" className="text-b4-regular text-fg-critical">
          {deleteError}
        </p>
      )}

      <ConfirmModal
        open={isConfirmOpen}
        title="정말 탈퇴할까요?"
        description="모든 데이터가 삭제되며 복구할 수 없어요."
        confirmLabel="탈퇴하기"
        tone="critical"
        confirming={isDeleting}
        onConfirm={handleDeleteUser}
        // 요청 중에는 닫아도 결과를 놓치므로 끝난 뒤에 닫게 둔다.
        onClose={() => {
          if (!isDeleting) setIsConfirmOpen(false);
        }}
      />
    </section>
  );
}
