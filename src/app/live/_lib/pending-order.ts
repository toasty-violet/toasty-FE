const PENDING_KEY = "pending-order-id";

/**
 * 결제 승인에 필요한 orderId 를 결제창 왕복 동안 들고 있기 위한 임시 보관소.
 *
 * 결제창은 외부로 나갔다가 successUrl 로 돌아오면서 페이지를 새로 띄우므로
 * 메모리 상태로는 값이 남지 않는다. 승인을 마치면 반드시 비운다.
 */
export function savePendingOrderId(orderId: number) {
  sessionStorage.setItem(PENDING_KEY, String(orderId));
}

export function loadPendingOrderId(): number | null {
  const raw = sessionStorage.getItem(PENDING_KEY);
  if (!raw) return null;

  // 손으로 고친 값이 들어와도 승인 요청을 보내지 않고 넘어간다.
  const orderId = Number(raw);
  return Number.isInteger(orderId) ? orderId : null;
}

export function clearPendingOrderId() {
  sessionStorage.removeItem(PENDING_KEY);
}
