import { Fragment } from "react";

import { formatThousand } from "@/lib/format";

// API 명세가 나오기 전이라 디자인 값을 그대로 둔다.
const ITEMS: { label: string; value: number | null; unit: string }[] = [
  { label: "총 판매", value: 312, unit: "건" },
  { label: "누적 구매자", value: 198, unit: "명" },
  { label: "누적 판매액", value: 2345000, unit: "원" },
];

export function SalesSummaryCard() {
  return (
    <section className="flex w-full flex-col gap-14">
      <h2 className="text-st1-bold text-fg-neutral-solid">판매 내역 요약</h2>

      <div className="bg-bg-layer-default rounded-12 flex w-full items-stretch justify-center gap-12 px-12 py-20">
        {ITEMS.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && (
              <div className="bg-stroke-neutral-weak w-px shrink-0" />
            )}
            <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-8 text-center">
              <span className="text-l2-bold text-fg-neutral-solid w-full truncate">
                {item.value === null
                  ? "-"
                  : `${formatThousand(item.value)}${item.unit}`}
              </span>
              <span className="text-l5-medium text-fg-neutral-secondary w-full">
                {item.label}
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
