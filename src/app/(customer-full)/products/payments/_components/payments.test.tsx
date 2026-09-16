import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { savePendingOrderId } from "@/app/live/_lib/pending-order";
import type { ProductDetail } from "@/types/product";
import type { SellerProfile } from "@/types/store";

import { PaymentScreen } from "./PaymentScreen";

const { replace, searchParams } = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParams: { current: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  useSearchParams: () => searchParams.current,
}));

const {
  getProduct,
  getSellerProfile,
  fetchCustomerProfile,
  createOrder,
  confirmOrderPayment,
  requestPoint3Payment,
  loadPoint3Widgets,
} = vi.hoisted(() => ({
  getProduct: vi.fn(),
  getSellerProfile: vi.fn(),
  fetchCustomerProfile: vi.fn(),
  createOrder: vi.fn(),
  confirmOrderPayment: vi.fn(),
  requestPoint3Payment: vi.fn(),
  loadPoint3Widgets: vi.fn(),
}));

vi.mock("@/lib/product-api", () => ({ getProduct }));
vi.mock("@/lib/store-api", () => ({ getSellerProfile }));
vi.mock("@/lib/user", () => ({ fetchCustomerProfile }));
vi.mock("@/lib/payment", () => ({ createOrder, confirmOrderPayment }));
vi.mock("@/lib/point3", async (importOriginal) => ({
  // 실패 코드 해석은 실제 구현을 그대로 쓴다.
  ...(await importOriginal<typeof import("@/lib/point3")>()),
  loadPoint3Widgets,
  requestPoint3Payment,
}));

const product: ProductDetail = {
  productId: 11,
  sellerId: 7,
  name: "아이보리 골지 가디건",
  price: 29000,
  description: "부드러운 소재",
  imageUrls: ["https://example.com/1.png"],
  otherProducts: [],
};

const seller: SellerProfile = {
  sellerId: 7,
  shopImageUrl: null,
  shopName: "토스티샵",
  followerCount: 240,
  productCount: 38,
  description: "소개",
  following: false,
};

function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <PaymentScreen productId={11} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  searchParams.current = new URLSearchParams();
  getProduct.mockResolvedValue(product);
  getSellerProfile.mockResolvedValue(seller);
  fetchCustomerProfile.mockResolvedValue({
    name: "홍길동",
    phoneNumber: "010-1234-5678",
    address: {
      postalCode: "12345",
      address: "서울시 강남구 테헤란로 123",
      detailAddress: "101동 101호",
    },
  });
  loadPoint3Widgets.mockResolvedValue({});
  createOrder.mockResolvedValue({
    orderId: 7,
    orderNumber: "20260916-8F3A21C0",
    sessionId: "ps_1",
    totalAmount: 29000,
    payerId: "payer:01M23CH34X3XPRDKVE5V5P50JP",
  });
});

describe("PaymentScreen", () => {
  it("배송지와 주문한 상품·금액을 보여준다", async () => {
    renderScreen();

    expect(await screen.findByText("홍길동")).toBeInTheDocument();
    expect(await screen.findByText("아이보리 골지 가디건")).toBeInTheDocument();
    expect(await screen.findByText("토스티샵")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "29,000원 결제하기" }),
    ).toBeEnabled();
  });

  it("결제하기를 누르면 주문을 만들고 결제창을 연다", async () => {
    renderScreen();

    await userEvent.click(
      await screen.findByRole("button", { name: "29,000원 결제하기" }),
    );

    await waitFor(() =>
      expect(createOrder).toHaveBeenCalledWith({ productId: 11, quantity: 1 }),
    );
    expect(loadPoint3Widgets).toHaveBeenCalledWith(
      "payer:01M23CH34X3XPRDKVE5V5P50JP",
    );
    await waitFor(() =>
      expect(requestPoint3Payment).toHaveBeenCalledWith(
        {},
        {
          sessionId: "ps_1",
          orderName: "아이보리 골지 가디건",
          returnPath: "/products/payments?productId=11",
        },
      ),
    );
  });

  // 결제창이 성공으로 돌아오면 orderId(=sessionId)를 달고 이 화면으로 다시 들어온다.
  it("결제창에서 돌아오면 승인하고 완료 화면으로 넘긴다", async () => {
    savePendingOrderId(7);
    searchParams.current = new URLSearchParams({ orderId: "ps_1" });
    confirmOrderPayment.mockResolvedValue({
      orderId: 7,
      status: "PAID",
      paidAt: "2026-09-16T09:00:00",
    });

    renderScreen();

    // react-query 가 mutationFn 에 컨텍스트를 함께 넘겨 첫 인자만 본다.
    await waitFor(() => expect(confirmOrderPayment.mock.calls[0]?.[0]).toBe(7));
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        "/products/payments/complete?sellerId=7",
      ),
    );
  });

  it("승인이 실패하면 완료 화면으로 넘기지 않고 알린다", async () => {
    savePendingOrderId(7);
    searchParams.current = new URLSearchParams({ orderId: "ps_1" });
    confirmOrderPayment.mockRejectedValue(new Error("실패"));

    renderScreen();

    expect(
      await screen.findByText(
        "결제 승인에 실패했어요. 주문내역에서 확인해 주세요.",
      ),
    ).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalledWith(
      expect.stringContaining("/products/payments/complete"),
    );
  });
});
