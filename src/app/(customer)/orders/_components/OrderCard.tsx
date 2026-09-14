"use client";

import Link from "next/link";

import RightSmallTightIcon from "@/assets/RightSmallTight.svg";
import type { CustomerOrder } from "@/types/order";

import { ORDER_STATUS, formatPaidDate } from "./order-status";
import { OrderProductRow } from "./OrderProductRow";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const TRACKING = "#2a3038"; // fg/neutral-solid-muted

/** 주문내역 카드 한 장. 발송완료면 상품 아래에 운송장이 붙는다. */
export function OrderCard({ order }: { order: CustomerOrder }) {
  // 발송완료가 아니면 서버가 운송장을 주지 않는다.
  const shipped = order.courier !== null && order.trackingNumber !== null;

  return (
    <li className="bg-bg-layer-default rounded-12 flex w-full flex-col gap-16 overflow-hidden p-16">
      <div className="flex w-full items-center justify-between gap-8 overflow-hidden">
        <div className="flex min-w-0 items-center gap-6">
          <span className="text-l3-semibold text-fg-neutral-solid shrink-0">
            {ORDER_STATUS[order.status]}
          </span>
          <span className="text-l5-medium text-fg-neutral-placeholder truncate">
            {formatPaidDate(order.paidAt)} 결제
          </span>
        </div>

        <Link
          href={`/orders/${order.orderId}`}
          className="text-l5-medium text-fg-neutral-secondary flex shrink-0 items-center gap-4"
        >
          주문상세
          <RightSmallTightIcon className="h-18 w-6 shrink-0" />
        </Link>
      </div>

      <div className="flex w-full flex-col gap-10 overflow-hidden">
        <OrderProductRow
          shopName={order.shopName}
          productName={order.productName}
          quantity={order.quantity}
          totalAmount={order.totalAmount}
          imageUrl={order.productImageUrl}
        />

        {shipped && (
          <div className="bg-bg-neutral-weak rounded-8 flex w-full items-center justify-between gap-8 px-12 py-10">
            <span className="text-l6-medium text-fg-neutral-secondary shrink-0">
              운송장 번호
            </span>
            <span
              className="text-l6-regular min-w-0 truncate"
              style={{ color: TRACKING }}
            >
              {order.courier} {order.trackingNumber}
            </span>
          </div>
        )}
      </div>
    </li>
  );
}
