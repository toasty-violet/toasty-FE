import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CustomerOrder, CustomerOrderDetail } from "@/types/order";

import { OrderDetailScreen } from "./OrderDetailScreen";
import { OrderFilterChips } from "./OrderFilterChips";
import { OrderListScreen } from "./OrderListScreen";

const { getMyOrders, getMyOrder } = vi.hoisted(() => ({
  getMyOrders: vi.fn(),
  getMyOrder: vi.fn(),
}));
vi.mock("../_lib/order-api", () => ({ getMyOrders, getMyOrder }));

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  getMyOrders.mockReset();
  getMyOrder.mockReset();
});

const order = (over: Partial<CustomerOrder> & { orderId: number }) => ({
  status: "SHIPPING_PENDING" as const,
  paidAt: "2026-09-15T10:02:34",
  sellerId: 1,
  shopName: "토스티샵",
  productName: "아이보리 골지 가디건",
  productImageUrl: "/i.png",
  quantity: 1,
  totalAmount: 29000,
  courier: null,
  trackingNumber: null,
  ...over,
});

const detail = (
  over: Partial<CustomerOrderDetail> = {},
): CustomerOrderDetail => ({
  orderId: 1,
  orderNumber: "20260915-100234",
  status: "SHIPPING_PENDING",
  sellerId: 1,
  shopName: "토스티샵",
  productName: "아이보리 골지 가디건",
  productImageUrl: "/i.png",
  quantity: 1,
  receiverName: "홍길동",
  receiverPhone: "010-1234-5678",
  postalCode: "12345",
  address: "서울시 강남구 테헤란로 123",
  detailAddress: "101동 101호",
  paidAt: "2026-08-28T18:23:00",
  productPrice: 95000,
  shippingFee: 3000,
  totalAmount: 98000,
  courier: null,
  trackingNumber: null,
  ...over,
});

function renderWith(ui: React.ReactNode) {
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {ui}
    </QueryClientProvider>,
  );
}

describe("OrderFilterChips", () => {
  it("건수가 아직 없으면 이름만 둔다", () => {
    renderWith(
      <OrderFilterChips status="ALL" counts={null} onChange={() => {}} />,
    );

    expect(screen.getByRole("button", { name: "전체" })).toBeInTheDocument();
  });

  it("건수가 오면 이름 뒤에 붙인다", () => {
    renderWith(
      <OrderFilterChips
        status="ALL"
        counts={{ all: 4, shippingPending: 2, shipped: 2 }}
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "전체 4" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "배송대기 2" }),
    ).toBeInTheDocument();
  });
});

describe("OrderListScreen", () => {
  it("주문이 없으면 없다고 알린다", async () => {
    getMyOrders.mockResolvedValue({
      counts: { all: 0, shippingPending: 0, shipped: 0 },
      items: [],
      nextCursor: null,
      hasNext: false,
    });

    renderWith(<OrderListScreen />);

    expect(await screen.findByText("주문 내역이 없어요")).toBeInTheDocument();
    // 고를 것이 없으면 칩도 두지 않는다.
    expect(screen.queryByRole("button", { name: /전체/ })).toBeNull();
  });

  // 거른 결과만 비었을 때는 다른 칩으로 돌아갈 수 있어야 한다.
  it("주문은 있는데 거른 결과만 비면 칩을 남긴다", async () => {
    getMyOrders.mockResolvedValue({
      counts: { all: 2, shippingPending: 2, shipped: 0 },
      items: [],
      nextCursor: null,
      hasNext: false,
    });

    renderWith(<OrderListScreen />);

    expect(await screen.findByText("주문 내역이 없어요")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "전체 2" })).toBeInTheDocument();
  });

  // 발송완료가 아니면 서버가 운송장을 주지 않는다.
  it("배송대기에는 운송장을 두지 않는다", async () => {
    getMyOrders.mockResolvedValue({
      counts: { all: 1, shippingPending: 1, shipped: 0 },
      items: [order({ orderId: 1 })],
      nextCursor: null,
      hasNext: false,
    });

    renderWith(<OrderListScreen />);

    // 칩 라벨도 건수가 오기 전엔 "배송대기" 라, 카드에만 있는 것을 기다린다.
    await screen.findByText("아이보리 골지 가디건");
    expect(screen.queryByText("운송장 번호")).toBeNull();
  });

  it("발송완료에는 운송장을 보여준다", async () => {
    getMyOrders.mockResolvedValue({
      counts: { all: 1, shippingPending: 0, shipped: 1 },
      items: [
        order({
          orderId: 1,
          status: "SHIPPED",
          courier: "CJ 대한통운",
          trackingNumber: "394817503811",
        }),
      ],
      nextCursor: null,
      hasNext: false,
    });

    renderWith(<OrderListScreen />);

    expect(await screen.findByText("운송장 번호")).toBeInTheDocument();
    expect(screen.getByText("CJ 대한통운 394817503811")).toBeInTheDocument();
  });

  it("칩을 고르면 그 상태로 다시 받는다", async () => {
    getMyOrders.mockResolvedValue({
      counts: { all: 1, shippingPending: 1, shipped: 0 },
      items: [order({ orderId: 1 })],
      nextCursor: null,
      hasNext: false,
    });

    renderWith(<OrderListScreen />);
    await screen.findByText("아이보리 골지 가디건");

    await userEvent.click(screen.getByRole("button", { name: "발송완료 0" }));

    expect(getMyOrders).toHaveBeenCalledWith(
      expect.objectContaining({ status: "SHIPPED" }),
    );
  });
});

describe("OrderDetailScreen", () => {
  it("배송대기에는 운송장 줄을 두지 않는다", async () => {
    getMyOrder.mockResolvedValue(detail());

    renderWith(<OrderDetailScreen orderId={1} />);

    expect(await screen.findByText("배송대기")).toBeInTheDocument();
    expect(screen.getByText("20260915-100234")).toBeInTheDocument();
    expect(screen.queryByText("운송장 번호")).toBeNull();
  });

  it("발송완료에는 운송장 줄을 보여준다", async () => {
    getMyOrder.mockResolvedValue(
      detail({
        status: "SHIPPED",
        courier: "CJ 대한통운",
        trackingNumber: "394817503811",
      }),
    );

    renderWith(<OrderDetailScreen orderId={1} />);

    expect(await screen.findByText("운송장 번호")).toBeInTheDocument();
    expect(screen.getByText("CJ 대한통운 394817503811")).toBeInTheDocument();
  });

  it("금액을 상품·배송비·합계로 나눠 보여준다", async () => {
    getMyOrder.mockResolvedValue(detail());

    renderWith(<OrderDetailScreen orderId={1} />);

    expect(await screen.findByText("95,000원")).toBeInTheDocument();
    expect(screen.getByText("3,000원")).toBeInTheDocument();
    // 합계는 상품 카드에도 같은 값이 떠서 결제 정보 줄로 좁힌다.
    const totalRow = screen.getByText("총 결제금액").closest("div")!;
    expect(within(totalRow).getByText("98,000원")).toBeInTheDocument();
  });
});
