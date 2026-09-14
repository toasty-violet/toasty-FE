import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiRequestError } from "@/lib/api-error";
import type { SellerOrder, SellerOrderDetail } from "@/types/order";

import { SellerOrderDetailScreen } from "./SellerOrderDetailScreen";
import { SellerOrderListScreen } from "./SellerOrderListScreen";

const { getSellerOrders, getSellerOrder, getCouriers, registerShipment } =
  vi.hoisted(() => ({
    getSellerOrders: vi.fn(),
    getSellerOrder: vi.fn(),
    getCouriers: vi.fn(),
    registerShipment: vi.fn(),
  }));

vi.mock("../_lib/seller-order-api", () => ({
  getSellerOrders,
  getSellerOrder,
  getCouriers,
  registerShipment,
}));

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  getSellerOrders.mockReset();
  getSellerOrder.mockReset();
  registerShipment.mockReset();
  getCouriers.mockResolvedValue([
    { code: "CJ_LOGISTICS", name: "CJ 대한통운" },
    { code: "HANJIN", name: "한진택배" },
  ]);
});

const order = (over: Partial<SellerOrder> = {}): SellerOrder => ({
  orderId: 1,
  status: "SHIPPING_PENDING",
  paidAt: "2026-09-15T10:02:34",
  receiverName: "이현지",
  productName: "아이보리 골지 가디건",
  productImageUrl: "/i.png",
  quantity: 1,
  totalAmount: 29000,
  courierName: null,
  trackingNumber: null,
  ...over,
});

const detail = (over: Partial<SellerOrderDetail> = {}): SellerOrderDetail => ({
  orderId: 1,
  orderNumber: "20260915-100234",
  status: "SHIPPING_PENDING",
  productName: "아이보리 골지 가디건",
  productImageUrl: "/i.png",
  quantity: 1,
  receiverName: "이현지",
  receiverPhone: "010-2345-6789",
  postalCode: "06236",
  address: "서울시 강남구 테헤란로 123",
  detailAddress: "101동 101호",
  paidAt: "2026-08-16T18:23:00",
  productPrice: 29000,
  shippingFee: 3000,
  totalAmount: 32000,
  courierName: null,
  trackingNumber: null,
  shippedAt: null,
  ...over,
});

const page = (items: SellerOrder[]) => ({
  counts: { all: items.length, shippingPending: items.length, shipped: 0 },
  items,
  nextCursor: null,
  hasNext: false,
});

function renderWith(ui: React.ReactNode) {
  render(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      {ui}
    </QueryClientProvider>,
  );
}

async function fillWaybill(trackingNumber: string) {
  await screen.findByRole("option", { name: "CJ 대한통운" });
  await userEvent.selectOptions(
    screen.getByRole("combobox", { name: "택배사" }),
    "CJ_LOGISTICS",
  );
  await userEvent.type(
    screen.getByRole("textbox", { name: "운송장 번호" }),
    trackingNumber,
  );
}

describe("SellerOrderListScreen", () => {
  it("배송대기 카드에 받는사람과 운송장 입력을 둔다", async () => {
    getSellerOrders.mockResolvedValue(page([order()]));
    renderWith(<SellerOrderListScreen />);

    expect(await screen.findByText("이현지")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "운송장 번호" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /주문상세/ })).toHaveAttribute(
      "href",
      "/shop/orders/1",
    );
  });

  it("발송완료 카드는 운송장을 읽기만 한다", async () => {
    getSellerOrders.mockResolvedValue(
      page([
        order({
          status: "SHIPPED",
          courierName: "CJ 대한통운",
          trackingNumber: "394817503811",
        }),
      ]),
    );
    renderWith(<SellerOrderListScreen />);

    expect(
      await screen.findByText("CJ 대한통운 394817503811"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "운송장 번호" })).toBeNull();
  });

  it("주문이 없으면 없다고 알리고 칩을 두지 않는다", async () => {
    getSellerOrders.mockResolvedValue({
      counts: { all: 0, shippingPending: 0, shipped: 0 },
      items: [],
      nextCursor: null,
      hasNext: false,
    });
    renderWith(<SellerOrderListScreen />);

    expect(await screen.findByText("주문 내역이 없어요")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /전체/ })).toBeNull();
  });
});

describe("WaybillForm", () => {
  it("택배사와 10자리 이상 번호가 있어야 등록할 수 있다", async () => {
    getSellerOrders.mockResolvedValue(page([order()]));
    renderWith(<SellerOrderListScreen />);

    await fillWaybill("123456789");
    expect(screen.getByRole("button", { name: "등록" })).toBeDisabled();

    await userEvent.type(
      screen.getByRole("textbox", { name: "운송장 번호" }),
      "0",
    );
    expect(screen.getByRole("button", { name: "등록" })).toBeEnabled();
  });

  it("하이픈을 빼고 택배사 코드로 등록한 뒤 목록을 다시 받는다", async () => {
    getSellerOrders.mockResolvedValue(page([order()]));
    registerShipment.mockResolvedValue(undefined);
    renderWith(<SellerOrderListScreen />);

    await fillWaybill("3948-1750-3811");
    await userEvent.click(screen.getByRole("button", { name: "등록" }));

    expect(registerShipment).toHaveBeenCalledWith(1, {
      courier: "CJ_LOGISTICS",
      trackingNumber: "394817503811",
    });
    await vi.waitFor(() => expect(getSellerOrders).toHaveBeenCalledTimes(2));
  });

  it("이미 발송완료된 주문이면 그렇게 알린다", async () => {
    getSellerOrders.mockResolvedValue(page([order()]));
    registerShipment.mockRejectedValue(
      new ApiRequestError("ORDER_ALREADY_SHIPPED", "이미", 409),
    );
    renderWith(<SellerOrderListScreen />);

    await fillWaybill("394817503811");
    await userEvent.click(screen.getByRole("button", { name: "등록" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "이미 발송완료된 주문이에요.",
    );
  });
});

describe("SellerOrderDetailScreen", () => {
  it("배송대기면 배송 정보 아래에 운송장 입력을 둔다", async () => {
    getSellerOrder.mockResolvedValue(detail());
    renderWith(<SellerOrderDetailScreen orderId={1} />);

    expect(await screen.findByText("20260915-100234")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "운송장 번호" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("운송장 번호")).toBeNull();
    // 상품 줄에는 합계가 아니라 상품 금액을 둔다.
    expect(screen.getAllByText("29,000원")).toHaveLength(2);
  });

  it("발송완료면 운송장 줄만 보여준다", async () => {
    getSellerOrder.mockResolvedValue(
      detail({
        status: "SHIPPED",
        courierName: "CJ 대한통운",
        trackingNumber: "1234567890",
        shippedAt: "2026-08-17T09:00:00",
      }),
    );
    renderWith(<SellerOrderDetailScreen orderId={1} />);

    expect(
      await screen.findByText("CJ 대한통운 1234567890"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "운송장 번호" })).toBeNull();
  });
});
