"use client";

import { useQuery } from "@tanstack/react-query";

import type { CustomerOrderDetail } from "@/types/order";

import { getMyOrder } from "../_lib/order-api";
import { ORDER_STATUS } from "./order-status";
import { OrderProductRow } from "./OrderProductRow";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const GAP = "#f7f8f9"; // bg/neutral-subtle
const BOX_LINE = "#edeef0"; // stroke/neutral-subtle
const LABEL = "#5b606b"; // fg/neutral-weak
const TOTAL = "#2a3038"; // fg/neutral-solid-muted

const won = (amount: number) => `${amount.toLocaleString("ko-KR")}원`;

/** 결제일시는 분까지 보여준다. */
function formatPaidAt(paidAt: string) {
  const date = new Date(paidAt);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** 섹션 사이를 8px 띠로 가른다. */
function SectionGap() {
  return (
    <div aria-hidden className="h-8 w-full" style={{ backgroundColor: GAP }} />
  );
}

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
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
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-start gap-8">
      <span className="text-b4-regular w-80 shrink-0" style={{ color: LABEL }}>
        {label}
      </span>
      <span className="text-b4-regular text-fg-neutral-solid min-w-0 flex-1">
        {value}
      </span>
    </div>
  );
}

/** 금액은 라벨과 값을 양 끝으로 민다. */
function AmountRow({ label, value }: { label: string; value: string }) {
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

function Detail({ order }: { order: CustomerOrderDetail }) {
  // 발송완료가 아니면 서버가 운송장을 주지 않아 그 줄을 두지 않는다.
  const shipped = order.courier !== null && order.trackingNumber !== null;

  return (
    <div className="bg-bg-layer-default flex flex-1 flex-col overflow-y-auto pb-56">
      <section className="bg-bg-layer-default flex w-full flex-col gap-10 p-20">
        <h2 className="text-l1-semibold text-fg-neutral-solid">
          {ORDER_STATUS[order.status]}
        </h2>
        <p className="text-l5-regular text-fg-neutral-secondary flex gap-4">
          <span>주문번호</span>
          <span>{order.orderNumber}</span>
        </p>
      </section>

      <SectionGap />

      <Section title="주문 상품">
        <OrderProductRow
          shopName={order.shopName}
          productName={order.productName}
          quantity={order.quantity}
          totalAmount={order.totalAmount}
          imageUrl={order.productImageUrl}
        />
      </Section>

      <SectionGap />

      <Section title="배송 정보">
        <div className="flex w-full flex-col gap-12">
          <InfoRow label="받는사람" value={order.receiverName} />
          <InfoRow label="연락처" value={order.receiverPhone} />
          <InfoRow
            label="배송지"
            value={`[${order.postalCode}] ${order.address} ${order.detailAddress}`.trim()}
          />
          {shipped && (
            <InfoRow
              label="운송장 번호"
              value={`${order.courier} ${order.trackingNumber}`}
            />
          )}
        </div>
      </Section>

      <SectionGap />

      <Section title="결제 정보">
        <div
          className="rounded-12 flex w-full flex-col gap-16 border p-16"
          style={{ borderColor: BOX_LINE }}
        >
          <div className="flex w-full flex-col gap-12">
            <AmountRow label="결제일시" value={formatPaidAt(order.paidAt)} />
            <AmountRow label="상품 금액" value={won(order.productPrice)} />
            <AmountRow label="배송비" value={won(order.shippingFee)} />
          </div>

          <div
            aria-hidden
            className="h-px w-full"
            style={{ backgroundColor: BOX_LINE }}
          />

          <div className="flex w-full items-center justify-between gap-8">
            <span className="text-l5-medium text-fg-neutral-solid">
              총 결제금액
            </span>
            <span className="text-l1-bold" style={{ color: TOTAL }}>
              {won(order.totalAmount)}
            </span>
          </div>
        </div>
      </Section>
    </div>
  );
}

/** 조회한 값으로 화면을 채우므로 값이 도착한 뒤에 그린다. */
export function OrderDetailScreen({ orderId }: { orderId: number }) {
  const {
    data: order,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["my-order", orderId],
    queryFn: () => getMyOrder(orderId),
  });

  if (!order) {
    return (
      <p
        role={isError ? "alert" : undefined}
        className="text-b4-regular text-fg-neutral-secondary flex flex-1 px-20 pt-20"
      >
        {isPending ? "주문을 불러오는 중이에요." : "주문을 불러오지 못했어요."}
      </p>
    );
  }

  return <Detail order={order} />;
}
