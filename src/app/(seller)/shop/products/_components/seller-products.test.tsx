import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { APP_FRAME_ID } from "@/components/overlays/app-frame";
import { ApiRequestError } from "@/lib/api-error";
import { PRODUCT_ERROR_CODE } from "@/types/product";
import type { SalesType, SellerProduct } from "@/types/product";

import { ProductActions } from "./ProductActions";
import { ProductFilterChips } from "./ProductFilterChips";
import { ProductListScreen } from "./ProductListScreen";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const { getSellerProducts, deleteSellerProduct } = vi.hoisted(() => ({
  getSellerProducts: vi.fn(),
  deleteSellerProduct: vi.fn(),
}));
vi.mock("../_lib/product-api", () => ({
  getSellerProducts,
  deleteSellerProduct,
}));

// jsdom 에는 교차 관찰자가 없다. 무한 스크롤은 관찰만 막고 목록 자체를 본다.
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
  push.mockClear();
  deleteSellerProduct.mockReset();
});

const product = (over: Partial<SellerProduct> & { productId: number }) => ({
  name: `상품 ${over.productId}`,
  price: 12000,
  stockQuantity: 1,
  salesType: "GENERAL" as SalesType,
  imageUrl: "/image.png",
  ...over,
});

function renderWith(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

describe("ProductFilterChips", () => {
  it("건수가 아직 없으면 이름만 둔다", () => {
    renderWith(
      <ProductFilterChips status="ALL" counts={null} onChange={() => {}} />,
    );

    expect(screen.getByRole("button", { name: "전체" })).toBeInTheDocument();
  });

  it("건수가 오면 이름 뒤에 붙인다", () => {
    renderWith(
      <ProductFilterChips
        status="ALL"
        counts={{ all: 32, onSale: 8, scheduled: 24 }}
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "전체 32" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "판매중 8" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "라이브 예정 24" }),
    ).toBeInTheDocument();
  });

  it("고른 칩만 눌린 것으로 둔다", () => {
    renderWith(
      <ProductFilterChips status="ON_SALE" counts={null} onChange={() => {}} />,
    );

    expect(screen.getByRole("button", { name: "판매중" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "전체" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});

describe("ProductListScreen", () => {
  it("받은 상품을 상태 배지와 함께 보여준다", async () => {
    getSellerProducts.mockResolvedValue({
      counts: { all: 2, onSale: 1, scheduled: 1 },
      items: [
        product({ productId: 1, name: "체크 쇼츠" }),
        product({ productId: 2, name: "레드 티셔츠", salesType: "LIVE" }),
      ],
      nextCursor: null,
      hasNext: false,
    });

    renderWith(<ProductListScreen />);

    expect(await screen.findByText("체크 쇼츠")).toBeInTheDocument();
    expect(screen.getByText("판매중")).toBeInTheDocument();
    expect(screen.getByText("라이브 예정")).toBeInTheDocument();
  });

  it("상품이 없으면 없다고 알린다", async () => {
    getSellerProducts.mockResolvedValue({
      counts: { all: 0, onSale: 0, scheduled: 0 },
      items: [],
      nextCursor: null,
      hasNext: false,
    });

    renderWith(<ProductListScreen />);

    expect(
      await screen.findByText("등록된 상품이 없어요."),
    ).toBeInTheDocument();
  });

  // 칩을 바꾸면 그 상태로 서버에 다시 묻는다.
  it("칩을 고르면 그 상태로 다시 받는다", async () => {
    getSellerProducts.mockResolvedValue({
      counts: { all: 2, onSale: 1, scheduled: 1 },
      items: [product({ productId: 1 })],
      nextCursor: null,
      hasNext: false,
    });

    renderWith(<ProductListScreen />);
    await screen.findByText("상품 1");

    await userEvent.click(screen.getByRole("button", { name: "판매중 1" }));

    await waitFor(() =>
      expect(getSellerProducts).toHaveBeenCalledWith(
        expect.objectContaining({ status: "ON_SALE" }),
      ),
    );
  });
});

describe("ProductActions", () => {
  const picked = product({ productId: 7, name: "체크 쇼츠" });

  it("수정하기는 그 상품의 수정 화면으로 보낸다", async () => {
    renderWith(<ProductActions product={picked} onClose={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: "수정하기" }));

    expect(push).toHaveBeenCalledWith("/shop/products/7/edit");
  });

  it("삭제는 확인을 받은 뒤에 보낸다", async () => {
    deleteSellerProduct.mockResolvedValue(undefined);
    renderWith(<ProductActions product={picked} onClose={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: "삭제하기" }));
    expect(deleteSellerProduct).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getByRole("button", { name: "삭제하기", hidden: false }),
    );

    await waitFor(() => expect(deleteSellerProduct).toHaveBeenCalledWith(7));
  });

  // 방송 중인 라이브에 편성된 상품은 서버가 막는다.
  it("방송 중이라 막히면 그 이유를 보여준다", async () => {
    deleteSellerProduct.mockRejectedValue(
      new ApiRequestError(PRODUCT_ERROR_CODE.BROADCASTING, "방송 중", 409),
    );
    renderWith(<ProductActions product={picked} onClose={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: "삭제하기" }));
    await userEvent.click(
      screen.getAllByRole("button", { name: "삭제하기" })[0],
    );

    expect(
      await screen.findByText(/방송이 끝난 뒤에 삭제할 수 있어요/),
    ).toBeInTheDocument();
  });

  // 지우면 그 라이브에 상품이 하나도 남지 않는다.
  it("마지막 상품이라 막히면 그 이유를 보여준다", async () => {
    deleteSellerProduct.mockRejectedValue(
      new ApiRequestError(PRODUCT_ERROR_CODE.LAST_IN_LIVE, "마지막", 409),
    );
    renderWith(<ProductActions product={picked} onClose={() => {}} />);

    await userEvent.click(screen.getByRole("button", { name: "삭제하기" }));
    await userEvent.click(
      screen.getAllByRole("button", { name: "삭제하기" })[0],
    );

    expect(
      await screen.findByText(/상품이 하나도 남지 않아요/),
    ).toBeInTheDocument();
  });
});
