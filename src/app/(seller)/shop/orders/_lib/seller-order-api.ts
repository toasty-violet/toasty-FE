import { apiClient } from "@/lib/api-client";
import type { ApiSuccess } from "@/types/api";
import type {
  Courier,
  OrderStatusFilter,
  SellerOrderDetail,
  SellerOrdersPage,
  ShipmentRequest,
} from "@/types/order";

/** 첫 요청은 cursor 없이 부르고, 목록 끝에 닿으면 nextCursor 를 그대로 넘긴다. */
export async function getSellerOrders(params: {
  status: OrderStatusFilter;
  cursor?: number | null;
}): Promise<SellerOrdersPage> {
  const { data } = await apiClient.get<ApiSuccess<SellerOrdersPage>>(
    "/seller/orders",
    { params: { status: params.status, cursor: params.cursor ?? undefined } },
  );
  return data.data;
}

export async function getSellerOrder(
  orderId: number,
): Promise<SellerOrderDetail> {
  const { data } = await apiClient.get<ApiSuccess<SellerOrderDetail>>(
    `/seller/orders/${orderId}`,
  );
  return data.data;
}

export async function getCouriers(): Promise<Courier[]> {
  const { data } = await apiClient.get<ApiSuccess<Courier[]>>("/couriers");
  return data.data;
}

/** 등록하면 발송완료로 넘어가고 되돌릴 수 없다. */
export async function registerShipment(
  orderId: number,
  body: ShipmentRequest,
): Promise<void> {
  await apiClient.patch(`/seller/orders/${orderId}/shipment`, body);
}
