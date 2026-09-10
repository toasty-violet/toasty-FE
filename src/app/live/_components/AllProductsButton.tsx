"use client";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const OVERLAY = "#1a1c20b2"; // bg/overlay

/** 상품 카드 옆에 붙는 전체 상품 시트로 가는 버튼. 셀러와 구매자가 함께 쓴다. */
export function AllProductsButton({
  totalCount,
  onClick,
}: {
  totalCount: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ backgroundColor: OVERLAY }}
      className="rounded-10 text-fg-neutral-inverted flex shrink-0 flex-col items-center justify-center gap-4 self-stretch px-12"
    >
      <span className="text-l3-medium">{totalCount}</span>
      <span className="text-l7-regular">전체상품</span>
    </button>
  );
}
