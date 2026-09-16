import type { ReactNode } from "react";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const GAP = "#f7f8f9"; // bg/neutral-subtle
export const BOX_LINE = "#edeef0"; // stroke/neutral-subtle
const LABEL = "#5b606b"; // fg/neutral-weak
const TOTAL = "#2a3038"; // fg/neutral-solid-muted

export const won = (amount: number) => `${amount.toLocaleString("ko-KR")}원`;

/** 섹션 사이를 8px 띠로 가른다. */
export function SectionGap() {
  return (
    <div aria-hidden className="h-8 w-full" style={{ backgroundColor: GAP }} />
  );
}

export function Section({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-bg-layer-default flex w-full flex-col gap-16 p-20">
      {title && (
        <h2 className="text-st2-semibold text-fg-neutral-solid w-full">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

/** 라벨을 왼쪽에 고정폭으로 두고 값이 남은 폭을 쓴다. */
export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-start gap-8">
      <span
        className="text-b4-regular w-[8rem] shrink-0"
        style={{ color: LABEL }}
      >
        {label}
      </span>
      <span className="text-b4-regular text-fg-neutral-solid min-w-0 flex-1">
        {value}
      </span>
    </div>
  );
}

/** 금액은 라벨과 값을 양 끝으로 민다. */
export function AmountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-start justify-between gap-8">
      <span className="text-b4-regular shrink-0" style={{ color: LABEL }}>
        {label}
      </span>
      <span className="text-b4-regular text-fg-neutral-solid shrink-0">
        {value}
      </span>
    </div>
  );
}

/**
 * 금액 줄들과 총액을 테두리 상자에 담는다.
 * 총액 위로 구분선이 들어가고, 총액만 굵게 뜬다.
 */
export function TotalBox({
  children,
  total,
}: {
  children: ReactNode;
  total: number;
}) {
  return (
    <div
      className="rounded-12 flex w-full flex-col gap-16 border p-16"
      style={{ borderColor: BOX_LINE }}
    >
      <div className="flex w-full flex-col gap-12">{children}</div>

      <div
        aria-hidden
        className="h-px w-full"
        style={{ backgroundColor: BOX_LINE }}
      />

      <div className="flex w-full items-center justify-between gap-8">
        <span className="text-l5-medium text-fg-neutral-solid">총 결제금액</span>
        <span className="text-l1-bold" style={{ color: TOTAL }}>
          {won(total)}
        </span>
      </div>
    </div>
  );
}
