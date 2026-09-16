import { apiClient } from "@/lib/api-client";
import type { ApiSuccess } from "@/types/api";
import type {
  OrderCreateRequest,
  OrderCreated,
  PaymentConfirmed,
  PayerIdSessionResponse,
} from "@/types/payment";

// payerId 를 얻기 위한 결제 세션 발급.
// 금액과 상품명은 백엔드가 정하고, 프론트는 발급된 sessionId 로 결제창만 띄운다.
export async function fetchPayerIdSession() {
  const { data } =
    await apiClient.get<PayerIdSessionResponse>("/payments/payer-id");

  return data.data.sessionId;
}

/** 주문을 만들고 그 주문의 결제 세션을 받는다. 아직 결제된 것은 아니다. */
export async function createOrder(
  body: OrderCreateRequest,
): Promise<OrderCreated> {
  const { data } = await apiClient.post<ApiSuccess<OrderCreated>>(
    "/orders",
    body,
  );
  return data.data;
}

/** 결제창이 성공으로 돌아온 뒤 서버에 승인을 요청한다. 이 요청까지 끝나야 주문이 선다. */
export async function confirmOrderPayment(
  orderId: number,
): Promise<PaymentConfirmed> {
  const { data } = await apiClient.post<ApiSuccess<PaymentConfirmed>>(
    `/orders/${orderId}/payment`,
  );
  return data.data;
}
