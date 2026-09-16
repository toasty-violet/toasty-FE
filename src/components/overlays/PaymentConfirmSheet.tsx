"use client";

import ExclamationIcon from "@/assets/Exclamation.svg";
import { Button } from "@/components/buttons/Button";
import { BottomSheet } from "./BottomSheet";

/**
 * 배송비. 셀러 스토어 설정(baseShippingFee)이지만 공개 시청 API 로는 내려오지
 * 않아 상수로 둔다. 응답에 실리면 그 값으로 바꾼다.
 */
export const SHIPPING_FEE = 0;

const won = (amount: number) => `${amount.toLocaleString("ko-KR")}원`;

function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-start justify-between">
      <span className="text-fg-neutral-primary">{label}</span>
      <span className="text-fg-neutral-solid">{value}</span>
    </div>
  );
}

/** 결제창을 열기 전에 금액과 제한 시간을 확인시키는 시트. */
export function PaymentConfirmSheet({
  open,
  price,
  pending = false,
  onClose,
  onConfirm,
}: {
  open: boolean;
  /** 상품 금액. 배송비는 여기서 더한다. */
  price: number;
  /** 결제창을 여는 중. 두 번 눌리지 않게 잠근다. */
  pending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="결제 전 확인해주세요">
      <div className="flex w-full flex-col gap-12">
        <div className="rounded-12 flex w-full flex-col gap-16 border border-[var(--color-gray-300)] p-16">
          <div className="text-b4-regular flex w-full flex-col gap-12">
            <AmountRow label="상품 금액" value={won(price)} />
            <AmountRow label="배송비" value={won(SHIPPING_FEE)} />
          </div>

          <div aria-hidden className="h-px w-full bg-[var(--color-gray-300)]" />

          <div className="flex w-full items-center justify-between">
            <span className="text-l5-medium text-fg-neutral-solid">
              총 결제금액
            </span>
            <span className="text-l1-bold text-fg-neutral-strong">
              {won(price + SHIPPING_FEE)}
            </span>
          </div>
        </div>

        <div className="bg-bg-warning-weak rounded-12 flex w-full items-center justify-center gap-8 px-12 py-10">
          <ExclamationIcon className="text-fg-warning size-14 shrink-0" />
          <p className="text-c1-medium text-fg-warning flex-1">
            결제를 시작한 후 5분 내 결제를 완료하지 않으면,
            <br />
            7일간 토스티에서 상품을 구매할 수 없어요.
          </p>
        </div>
      </div>

      <div className="flex w-full gap-10">
        <Button
          label="취소"
          variant="outlined"
          color="assistive"
          fullWidth
          onClick={onClose}
        />
        <Button
          label="결제하기"
          fullWidth
          disabled={pending}
          onClick={onConfirm}
        />
      </div>
    </BottomSheet>
  );
}
