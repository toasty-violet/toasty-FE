"use client";

import { Chip } from "@/components/buttons/Chip";
import type { OrderCounts, OrderStatusFilter } from "@/types/order";

const FILTERS: { value: OrderStatusFilter; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "SHIPPING_PENDING", label: "배송대기" },
  { value: "SHIPPED", label: "발송완료" },
];

/** 건수는 서버가 첫 묶음에만 준다. 아직 없으면 숫자 없이 이름만 둔다. */
function labelOf(filter: (typeof FILTERS)[number], counts: OrderCounts | null) {
  if (!counts) return filter.label;
  const count =
    filter.value === "SHIPPING_PENDING"
      ? counts.shippingPending
      : filter.value === "SHIPPED"
        ? counts.shipped
        : counts.all;
  return `${filter.label} ${count}`;
}

export function OrderFilterChips({
  status,
  counts,
  onChange,
}: {
  status: OrderStatusFilter;
  counts: OrderCounts | null;
  onChange: (status: OrderStatusFilter) => void;
}) {
  return (
    <div className="scrollbar-hidden flex w-full gap-6 overflow-x-auto">
      {FILTERS.map((filter) => (
        <Chip
          key={filter.value}
          label={labelOf(filter, counts)}
          selected={status === filter.value}
          onClick={() => onChange(filter.value)}
        />
      ))}
    </div>
  );
}
