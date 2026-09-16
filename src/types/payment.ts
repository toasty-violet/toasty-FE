import type { ApiSuccess } from "@/types/api";

// 결제 세션 발급 응답. point3 세션 생성 결과의 id 를 sessionId 로 받는다.
export type PayerIdSessionResponse = ApiSuccess<{ sessionId: string }>;

/** 주문 생성 요청. 금액은 서버가 상품에서 정하므로 보내지 않는다. */
export interface OrderCreateRequest {
  productId: number;
  quantity: number;
  /** 라이브를 보다 샀으면 그 라이브. 셀러 라이브탭의 방송별 판매 집계에 쓰인다. */
  liveId?: number;
}

/** 주문과 함께 결제 세션이 발급된다. sessionId 로 결제창을 띄운다. */
export interface OrderCreated {
  orderId: number;
  orderNumber: string;
  sessionId: string;
  totalAmount: number;
  /**
   * 계좌를 등록한 구매자의 식별자. 결제창을 띄울 때 customerKey 로 넘겨야
   * 등록해 둔 결제수단이 따라붙는다.
   */
  payerId: string;
}

/** 결제 승인 결과. 승인 직후에는 아직 PAYMENT_PENDING 일 수 있다. */
export interface PaymentConfirmed {
  orderId: number;
  status: string;
  paidAt: string;
}
