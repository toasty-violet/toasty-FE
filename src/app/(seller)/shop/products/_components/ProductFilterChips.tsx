"use client";

import { Chip } from "@/components/buttons/Chip";
import type { SellerProductCounts, SellerProductFilter } from "@/types/product";

const FILTERS: { value: SellerProductFilter; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "ON_SALE", label: "판매중" },
  { value: "SCHEDULED", label: "라이브 예정" },
];

/** 건수는 서버가 첫 묶음에만 준다. 아직 없으면 숫자 없이 이름만 둔다. */
function labelOf(
  filter: (typeof FILTERS)[number],
  counts: SellerProductCounts | null,
) {
  if (!counts) return filter.label;
  const count =
    filter.value === "ON_SALE"
      ? counts.onSale
      : filter.value === "SCHEDULED"
        ? counts.scheduled
        : counts.all;
  return `${filter.label} ${count}`;
}

export function ProductFilterChips({
  status,
  counts,
  onChange,
}: {
  status: SellerProductFilter;
  counts: SellerProductCounts | null;
  onChange: (status: SellerProductFilter) => void;
}) {
  return (
    <div className="scrollbar-hidden flex flex-1 gap-6 overflow-x-auto">
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
