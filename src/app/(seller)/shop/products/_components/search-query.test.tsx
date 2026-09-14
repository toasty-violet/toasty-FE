import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";

import { APP_FRAME_ID } from "@/components/overlays/app-frame";

import { ProductSearchScreen } from "./ProductSearchScreen";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const { getSellerProducts } = vi.hoisted(() => ({
  getSellerProducts: vi.fn(),
}));
vi.mock("../_lib/product-api", () => ({
  getSellerProducts,
  deleteSellerProduct: vi.fn(),
}));

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  const frame = document.createElement("div");
  frame.id = APP_FRAME_ID;
  document.body.append(frame);
  getSellerProducts.mockReset();
  getSellerProducts.mockResolvedValue({
    counts: { all: 0, onSale: 0, scheduled: 0 },
    items: [],
    nextCursor: null,
    hasNext: false,
  });
});

function renderSearch() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <ProductSearchScreen />
    </QueryClientProvider>,
  );
}

it("적기 전에는 서버에 묻지 않는다", async () => {
  renderSearch();

  await screen.findByText("찾을 상품 이름을 적어 주세요.");
  expect(getSellerProducts).not.toHaveBeenCalled();
});

it("적기 전에 칩을 눌러도 묻지 않는다", async () => {
  renderSearch();

  await userEvent.click(screen.getByRole("button", { name: "판매중" }));

  expect(getSellerProducts).not.toHaveBeenCalled();
});

it("적으면 그때 묻는다", async () => {
  renderSearch();

  await userEvent.type(
    screen.getByRole("textbox", { name: "상품 검색" }),
    "가디건",
  );

  await waitFor(() =>
    expect(getSellerProducts).toHaveBeenCalledWith(
      expect.objectContaining({ keyword: "가디건" }),
    ),
  );
});

// enabled 가 false 면 isPending 은 계속 true 다. 그대로 그리면 빈 화면에
// "찾는 중이에요." 가 떠 있게 된다.
it("적기 전에는 찾는 중이라고 하지 않는다", async () => {
  renderSearch();

  await screen.findByText("찾을 상품 이름을 적어 주세요.");
  expect(screen.queryByText("찾는 중이에요.")).toBeNull();
});
