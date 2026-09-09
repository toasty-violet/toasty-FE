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
 * 등록 실패로 돌아왔을 때 화면에 무엇을 보여줄지.
 *
 * point3 는 메시지가 아니라 code 로 분기하라고 안내한다.
 * 창을 닫은 것은 실패가 아니므로 아무것도 띄우지 않는다.
 */
export function resolvePoint3FailMessage(code: string | null): string {
  switch (code) {
    // 실패로 돌아온 것이 아니다.
    case null:
      return "";
    // 사용자가 그냥 창을 닫았다. 실패로 취급하지 않는다.
    case "PAYMENT_WINDOW_CLOSED":
      return "";
    // 세션이 만료·무효라 다시 발급받으면 풀린다.
    case "SESSION_EXPIRED":
    case "INVALID_SESSION":
      return "계좌 등록 시간이 만료됐어요. 다시 시도해 주세요.";
    // 계정이 비활성이라 재시도로는 풀리지 않는다.
    case "PAYER_DEACTIVATED":
      return "사용할 수 없는 계정이에요. 고객센터에 문의해 주세요.";
    default:
      return "계좌 등록에 실패했어요. 다시 시도해 주세요.";
  }
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
