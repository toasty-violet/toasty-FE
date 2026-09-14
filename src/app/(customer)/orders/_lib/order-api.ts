import { apiClient } from "@/lib/api-client";
import type { ApiSuccess } from "@/types/api";
import type {
  CustomerOrderDetail,
  CustomerOrdersPage,
  OrderStatusFilter,
} from "@/types/order";

/** 첫 요청은 cursor 없이 부르고, 목록 끝에 닿으면 nextCursor 를 그대로 넘긴다. */
export async function getMyOrders(params: {
  status: OrderStatusFilter;
  cursor?: number | null;
}): Promise<CustomerOrdersPage> {
  const { data } = await apiClient.get<ApiSuccess<CustomerOrdersPage>>(
    "/orders",
    { params: { status: params.status, cursor: params.cursor ?? undefined } },
  );
  return data.data;
}

export async function getMyOrder(
  orderId: number,
): Promise<CustomerOrderDetail> {
  const { data } = await apiClient.get<ApiSuccess<CustomerOrderDetail>>(
    `/orders/${orderId}`,
  );
  return data.data;
}
