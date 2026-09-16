import type { LiveProduct } from "@/types/live";

const MUTED = "bg-bg-neutral-weak text-fg-neutral-secondary";

const SCHEDULED = { label: "판매대기", className: MUTED };
const ACTIVE = { label: "판매중", className: "bg-bg-brand-weak text-fg-brand" };
const CLOSED = { label: "판매완료", className: MUTED };

/**
 * 카드에 붙는 판매 상태.
 *
 * 서버는 고정한 뒤 ACTIVE 로 두고 되돌리지 않아, 다 팔려도 편성 상태는 그대로다.
 * 셀러가 보기에는 팔린 것이 끝난 것이므로 재고가 없으면 판매완료로 적는다.
 */
export function saleStatusOf(product: LiveProduct) {
  if (product.status === "SCHEDULED") return SCHEDULED;
  if (product.status === "CLOSED" || product.stockQuantity === 0) {
    return CLOSED;
  }
  return ACTIVE;
}
