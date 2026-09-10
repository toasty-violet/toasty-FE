"use client";

import type { ReactNode } from "react";

import { BottomSheet } from "@/components/overlays/BottomSheet";

/** 이번 방송에 편성된 상품 전체를 담는 시트. 줄의 생김새는 화면마다 다르다. */
export function ProductSheet({
  open,
  isEmpty,
  onClose,
  children,
}: {
  open: boolean;
  /** children 이 빌 조건과 같아야 한다. 걸러서 넘긴다면 거른 뒤 개수로 낸다. */
  isEmpty: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <BottomSheet open={open} onClose={onClose} title="전체 상품">
      {isEmpty ? (
        <p className="text-l5-medium text-fg-neutral-secondary py-20">
          편성된 상품이 없어요.
        </p>
      ) : (
        <ul className="flex w-full flex-1 flex-col gap-12">{children}</ul>
      )}
    </BottomSheet>
  );
}
