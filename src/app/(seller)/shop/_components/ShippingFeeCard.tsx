// API 명세가 나오기 전이라 디자인 값을 그대로 둔다.
const ROWS = [
  { label: "기본 배송비", value: "3,000원" },
  { label: "무료배송 기준 금액", value: "100,000원" },
  { label: "도서산간 배송비", value: "5,000원" },
];

export function ShippingFeeCard() {
  return (
    <section className="flex w-full flex-col gap-14">
      <h2 className="text-st1-bold text-fg-neutral-solid">배송비</h2>

      <div className="bg-bg-layer-default rounded-12 flex w-full flex-col gap-12 p-16">
        {ROWS.map((row) => (
          <div key={row.label} className="flex w-full items-start gap-12">
            <span className="text-b4-regular text-fg-neutral-primary shrink-0">
              {row.label}
            </span>
            <span className="text-b4-regular text-fg-neutral-solid min-w-0 flex-1 text-right">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
