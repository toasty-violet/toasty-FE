"use client";

import { useId } from "react";

import ExclamationIcon from "@/assets/Exclamation.svg";

import { Modal } from "./Modal";

/** 결제를 마쳤다고 알리는 창. 배송비 환불 안내를 함께 보여준다. */
export function PaymentDoneModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <h2
        id={titleId}
        className="text-t3-bold text-fg-neutral-solid w-full text-center"
      >
        결제가 완료되었습니다
      </h2>

      <div className="bg-bg-positive-weak rounded-12 flex w-full items-center justify-center gap-8 px-12 py-10">
        <ExclamationIcon className="size-14 shrink-0 text-[var(--color-green-800)]" />
        <p className="text-c1-medium flex-1 text-[var(--color-green-800)]">
          같은 방송에서 10만 원 이상 구매 시,
          <br />
          방송 종료 후 배송비를 환불해드려요.
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-l4-semibold text-fg-neutral-inverted rounded-10 h-[4.4rem] w-full bg-[#2a3038] px-20"
      >
        확인
      </button>
    </Modal>
  );
}
