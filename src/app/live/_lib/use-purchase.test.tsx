import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiRequestError } from "@/lib/api-error";

import { loadPendingOrderId, savePendingOrderId } from "./pending-order";
import { usePurchase } from "./use-purchase";

const { replace, searchParams } = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: { current: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams.current,
}));

const { createOrder, confirmOrderPayment } = vi.hoisted(() => ({
  createOrder: vi.fn(),
  confirmOrderPayment: vi.fn(),
}));

vi.mock("@/lib/payment", () => ({ createOrder, confirmOrderPayment }));

const { requestPoint3Payment, loadPoint3Widgets } = vi.hoisted(() => ({
  requestPoint3Payment: vi.fn(),
  loadPoint3Widgets: vi.fn(async () => ({})),
}));

vi.mock("@/lib/point3", async (importOriginal) => ({
  // 실패 코드 해석은 실제 구현을 그대로 쓴다.
  ...(await importOriginal<typeof import("@/lib/point3")>()),
  loadPoint3Widgets,
  requestPoint3Payment,
}));

const RETURN_PATH = "/live/abc";

const PRODUCT = { productId: 3, name: "상품 3", price: 32000 };

function render() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return renderHook(() => usePurchase({ returnPath: RETURN_PATH }), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  searchParams.current = new URLSearchParams();
  // clearAllMocks 가 구현까지 지우므로 매번 되돌려 놓는다.
  loadPoint3Widgets.mockResolvedValue({});
  createOrder.mockResolvedValue({
    orderId: 7,
    orderNumber: "20260916-8F3A21C0",
    sessionId: "ps_1",
    totalAmount: 32000,
    payerId: "payer:01M23CH34X3XPRDKVE5V5P50JP",
  });
});

describe("구매하기를 누르면", () => {
  // 금액을 보여주기 전에 주문이 서면 취소해도 주문이 남는다.
  it("확인 시트만 열고 아직 주문하지 않는다", () => {
    const { result } = render();

    act(() => result.current.buy(PRODUCT));

    expect(result.current.confirming).toEqual(PRODUCT);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it("취소하면 시트를 닫고 주문하지 않는다", () => {
    const { result } = render();

    act(() => result.current.buy(PRODUCT));
    act(() => result.current.closeConfirm());

    expect(result.current.confirming).toBeNull();
    expect(createOrder).not.toHaveBeenCalled();
  });
});

describe("확인 시트에서 결제하기를 누르면", () => {
  it("주문을 만들고 그 세션으로 결제창을 띄운다", async () => {
    const { result } = render();

    act(() => result.current.buy(PRODUCT));
    act(() => result.current.confirmBuy());

    await waitFor(() =>
      expect(createOrder).toHaveBeenCalledWith({ productId: 3, quantity: 1 }),
    );
    await waitFor(() =>
      expect(requestPoint3Payment).toHaveBeenCalledWith(expect.anything(), {
        sessionId: "ps_1",
        orderName: "상품 3",
        returnPath: RETURN_PATH,
      }),
    );
  });

  // payerId 없이 열면 등록해 둔 결제수단이 따라붙지 않는다.
  it("주문이 준 payerId 로 결제창을 연다", async () => {
    const { result } = render();

    act(() => result.current.buy(PRODUCT));
    act(() => result.current.confirmBuy());

    await waitFor(() =>
      expect(loadPoint3Widgets).toHaveBeenCalledWith(
        "payer:01M23CH34X3XPRDKVE5V5P50JP",
      ),
    );
  });

  // 결제창으로 나가면 메모리 상태가 사라져, 남겨두지 않으면 승인할 수 없다.
  it("결제창으로 나가기 전에 orderId 를 남긴다", async () => {
    const { result } = render();

    act(() => result.current.buy(PRODUCT));
    act(() => result.current.confirmBuy());

    await waitFor(() => expect(loadPendingOrderId()).toBe(7));
  });

  it("주문에 실패하면 안내하고 남긴 orderId 를 지운다", async () => {
    createOrder.mockRejectedValue(new Error("nope"));
    const { result } = render();

    act(() => result.current.buy(PRODUCT));
    act(() => result.current.confirmBuy());

    await waitFor(() =>
      expect(result.current.message).toBe(
        "결제창을 열지 못했어요. 다시 시도해 주세요.",
      ),
    );
    expect(loadPendingOrderId()).toBeNull();
  });
});

describe("결제창에서 돌아오면", () => {
  it("성공이면 남긴 주문으로 승인을 요청하고 완료를 알린다", async () => {
    savePendingOrderId(7);
    searchParams.current = new URLSearchParams("orderId=ps_1");
    confirmOrderPayment.mockResolvedValue({
      orderId: 7,
      status: "PAYMENT_PENDING",
      paidAt: "2026-09-16T00:00:00Z",
    });

    const { result } = render();

    // react-query 가 mutationFn 에 컨텍스트를 함께 넘겨 첫 인자만 본다.
    await waitFor(() => expect(confirmOrderPayment.mock.calls[0]?.[0]).toBe(7));
    await waitFor(() => expect(result.current.done).toBe(true));
    // 새로고침에 같은 승인이 다시 돌지 않도록 쿼리를 턴다.
    expect(replace).toHaveBeenCalledWith(RETURN_PATH);
    expect(loadPendingOrderId()).toBeNull();
  });

  it("남긴 주문이 없으면 승인을 보내지 않는다", async () => {
    searchParams.current = new URLSearchParams("orderId=ps_1");

    render();

    await waitFor(() => expect(replace).not.toHaveBeenCalled());
    expect(confirmOrderPayment).not.toHaveBeenCalled();
  });

  it("승인에 실패하면 주문내역을 안내한다", async () => {
    savePendingOrderId(7);
    searchParams.current = new URLSearchParams("orderId=ps_1");
    confirmOrderPayment.mockRejectedValue(new Error("nope"));

    const { result } = render();

    await waitFor(() =>
      expect(result.current.message).toBe(
        "결제 승인에 실패했어요. 주문내역에서 확인해 주세요.",
      ),
    );
    expect(result.current.done).toBe(false);
    expect(loadPendingOrderId()).toBeNull();
  });

  // 창을 닫은 것은 실패가 아니라 안내하지 않는다.
  it("실패 코드로 돌아오면 승인 없이 안내만 한다", async () => {
    searchParams.current = new URLSearchParams("code=SESSION_EXPIRED");

    const { result } = render();

    await waitFor(() =>
      expect(result.current.message).toBe(
        "결제 시간이 만료됐어요. 다시 시도해 주세요.",
      ),
    );
    expect(confirmOrderPayment).not.toHaveBeenCalled();
  });
});

// 라이브를 보다 산 주문은 그 방송의 판매 집계에 들어가야 한다.
describe("라이브에서 사면", () => {
  it("주문에 liveId 를 함께 보낸다", async () => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const { result } = renderHook(
      () => usePurchase({ returnPath: RETURN_PATH, liveId: 12 }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        ),
      },
    );

    act(() => result.current.buy(PRODUCT));
    act(() => result.current.confirmBuy());

    await waitFor(() =>
      expect(createOrder).toHaveBeenCalledWith({
        productId: 3,
        quantity: 1,
        liveId: 12,
      }),
    );
  });
});

// 503 은 승인이 실패한 것이 아니라 서버가 결과를 확인하지 못한 것이다.
describe("승인 결과를 확인하지 못하면", () => {
  it("다시 물어보고, 그래도 모르면 확인 중이라고 알린다", async () => {
    savePendingOrderId(7);
    searchParams.current = new URLSearchParams("orderId=ps_1");
    confirmOrderPayment.mockRejectedValue(
      new ApiRequestError("PAYMENT_UNCONFIRMED", "확인 불가", 503),
    );

    const { result } = render();

    await waitFor(
      () => expect(confirmOrderPayment.mock.calls.length).toBeGreaterThan(1),
      { timeout: 10000 },
    );
    await waitFor(
      () =>
        expect(result.current.message).toBe(
          "결제 결과를 확인하는 중이에요. 주문내역에서 확인해 주세요.",
        ),
      { timeout: 10000 },
    );
  }, 15000);
});
