import {
  ANONYMOUS,
  loadTossPayments,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";

// point3 위젯은 토스페이먼츠 SDK 로더에 자기 주소를 물려주는 방식으로 동작한다.
const POINT3_SDK_SRC = "https://widget.point3.io/v2/standard?loader=toss";

// 실제 청구 금액은 결제 세션에 담겨 있고, 이 값은 SDK 호환을 위한 고정값이다.
const COMPATIBILITY_AMOUNT = { currency: "KRW", value: 1 } as const;

/**
 * point3 결제 위젯을 준비한다.
 *
 * 세션 발급과 무관하게 먼저 띄워둘 수 있으므로, 결제 요청과 분리해 호출한다.
 */
export async function loadPoint3Widgets(): Promise<TossPaymentsWidgets> {
  const clientKey = process.env.NEXT_PUBLIC_POINT3_CLIENT_ID;
  if (!clientKey) {
    throw new Error("NEXT_PUBLIC_POINT3_CLIENT_ID 가 설정되지 않았습니다.");
  }

  const point3Payments = await loadTossPayments(clientKey, {
    src: POINT3_SDK_SRC,
  });

  const widgets = point3Payments.widgets({ customerKey: ANONYMOUS });
  await widgets.setAmount(COMPATIBILITY_AMOUNT);

  return widgets;
}

/**
 * 결제창을 띄운다. 성공하면 successUrl 로 이동하므로 이 함수는 값을 돌려주지 않는다.
 *
 * successUrl/failUrl 은 HTTPS 절대 URL 이어야 해서 NEXT_PUBLIC_BASE_URL 을 앞에 붙인다.
 */
export function requestPoint3Payment(
  widgets: TossPaymentsWidgets,
  { sessionId, orderName }: { sessionId: string; orderName: string },
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL 이 설정되지 않았습니다.");
  }

  const returnUrl = `${baseUrl}/onboarding/customer/payment-register`;

  return widgets.requestPayment({
    orderId: sessionId,
    orderName,
    successUrl: returnUrl,
    failUrl: returnUrl,
  });
}
