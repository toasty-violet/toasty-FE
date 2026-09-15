"use client";

import { useQuery } from "@tanstack/react-query";

import type { OrderDetail } from "@/types/order";

import {
  AmountRow,
  InfoRow,
  Section,
  SectionGap,
  TotalBox,
  won,
} from "@/components/sections/InfoSection";

import { getMyOrder } from "../_lib/order-api";
import { ORDER_STATUS } from "./order-status";
import { OrderProductRow } from "@/components/cards/OrderProductRow";

/** 결제일시는 분까지 보여준다. */
function formatPaidAt(paidAt: string) {
  const date = new Date(paidAt);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * 주문 상세 본문. 구매자와 셀러가 같은 모양을 쓴다.
 * 셀러는 배송대기일 때 배송 정보 아래에 운송장 입력(shippingAction)을 붙인다.
 */
export function OrderDetailView({
  order,
  productLabel,
  shippingAction,
}: {
  order: OrderDetail;
  productLabel?: string;
  shippingAction?: React.ReactNode;
}) {
  // 발송완료가 아니면 서버가 운송장을 주지 않아 그 줄을 두지 않는다.
  const shipped = order.courierName !== null && order.trackingNumber !== null;

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
          label={productLabel}
          productName={order.productName}
          quantity={order.quantity}
          totalAmount={order.productPrice}
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
              value={`${order.courierName} ${order.trackingNumber}`}
            />
          )}
        </div>
        {shippingAction}
      </Section>

      <SectionGap />

      <Section title="결제 정보">
        <TotalBox total={order.totalAmount}>
          <AmountRow label="결제일시" value={formatPaidAt(order.paidAt)} />
          <AmountRow label="상품 금액" value={won(order.productPrice)} />
          <AmountRow label="배송비" value={won(order.shippingFee)} />
        </TotalBox>
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

  return <OrderDetailView order={order} productLabel={order.shopName} />;
}
