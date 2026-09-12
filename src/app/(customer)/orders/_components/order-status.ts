import type { OrderStatus } from "@/types/order";

/** 주문 상태 문구. 셀러 주문탭과 구매자 주문내역이 같은 말을 쓴다. */
export const ORDER_STATUS: Record<OrderStatus, string> = {
  SHIPPING_PENDING: "배송대기",
  SHIPPED: "발송완료",
};

/** 결제일은 연·월·일만 보여준다. */
export function formatPaidDate(paidAt: string) {
  const date = new Date(paidAt);
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}
