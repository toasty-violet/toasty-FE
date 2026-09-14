import type { LiveProductStatus } from "@/types/live";

/**
 * 편성 상태를 화면 문구로 옮긴다. 재고와는 별개다 —
 * 서버는 고정한 뒤 ACTIVE 로 두고 되돌리지 않으며, 재고가 0이어도 상태는 그대로다.
 */
export const SALE_STATUS: Record<
  LiveProductStatus,
  { label: string; className: string }
> = {
  SCHEDULED: {
    label: "판매대기",
    className: "bg-bg-neutral-weak text-fg-neutral-secondary",
  },
  ACTIVE: { label: "판매중", className: "bg-bg-brand-weak text-fg-brand" },
  CLOSED: {
    label: "판매완료",
    className: "bg-bg-neutral-weak text-fg-neutral-secondary",
  },
};
