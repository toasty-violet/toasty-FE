import type { SalesType } from "@/types/product";

/** 상품탭 배지. 송출 화면의 편성 상태와 달리 판매 방식을 말한다. */
export const PRODUCT_STATUS: Record<
  SalesType,
  { label: string; className: string }
> = {
  GENERAL: { label: "판매중", className: "bg-bg-brand-weak text-fg-brand" },
  LIVE: {
    label: "라이브 예정",
    className: "bg-bg-neutral-weak text-fg-neutral-placeholder",
  },
};
