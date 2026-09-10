import { apiClient } from "@/lib/api-client";
import type { PayerIdSessionResponse } from "@/types/payment";

// payerId 를 얻기 위한 결제 세션 발급.
// 금액과 상품명은 백엔드가 정하고, 프론트는 발급된 sessionId 로 결제창만 띄운다.
export async function fetchPayerIdSession() {
  const { data } =
    await apiClient.get<PayerIdSessionResponse>("/payments/payer-id");

  return data.data.sessionId;
}
