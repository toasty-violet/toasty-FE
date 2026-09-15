"use client";

import { useQuery } from "@tanstack/react-query";

import { OrderDetailView } from "@/app/(customer)/orders/_components/OrderDetailScreen";

import { getSellerOrder } from "../_lib/seller-order-api";
import { WaybillForm } from "./WaybillForm";

/** 조회한 값으로 화면을 채우므로 값이 도착한 뒤에 그린다. */
export function SellerOrderDetailScreen({ orderId }: { orderId: number }) {
  const {
    data: order,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["seller-order", orderId],
    queryFn: () => getSellerOrder(orderId),
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

  return (
    <OrderDetailView
      order={order}
      shippingAction={
        order.status === "SHIPPING_PENDING" && (
          <WaybillForm orderId={order.orderId} />
        )
      }
    />
  );
}
