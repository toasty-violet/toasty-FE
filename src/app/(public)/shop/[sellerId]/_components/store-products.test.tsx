import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { StoreProduct, StoreProductsPage } from "@/types/product";

import { StoreProductsSection } from "./StoreProductsSection";

const { getStoreProductsMock } = vi.hoisted(() => ({
  getStoreProductsMock: vi.fn(),
}));

vi.mock("@/lib/store-api", () => ({
  getStoreProducts: getStoreProductsMock,
}));

function product(overrides: Partial<StoreProduct> = {}): StoreProduct {
  return {
    productId: 11,
    name: "아이보리 골지 가디건",
    price: 29000,
    imageUrl: "https://example.com/1.png",
    ...overrides,
  };
}

function page(items: StoreProduct[]): StoreProductsPage {
  return { items, nextCursor: null, hasNext: false };
}

function renderSection() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <StoreProductsSection sellerId={7} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  getStoreProductsMock.mockReset();
});

describe("StoreProductsSection", () => {
  it("상품을 상품 상세 링크로 묶어 보여준다", async () => {
    getStoreProductsMock.mockResolvedValue(page([product()]));
    renderSection();

    expect(await screen.findByText("29,000원")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /아이보리 골지 가디건/ }),
    ).toHaveAttribute("href", "/products/11");
  });

  it("첫 묶음은 cursor 없이 부른다", async () => {
    getStoreProductsMock.mockResolvedValue(page([product()]));
    renderSection();

    await screen.findByText("29,000원");
    expect(getStoreProductsMock).toHaveBeenCalledWith(7, null);
  });

  it("상품이 없으면 없다고 알린다", async () => {
    getStoreProductsMock.mockResolvedValue(page([]));
    renderSection();

    expect(
      await screen.findByText("등록된 상품이 없어요."),
    ).toBeInTheDocument();
  });

  it("조회에 실패하면 실패를 알린다", async () => {
    getStoreProductsMock.mockRejectedValue(new Error("실패"));
    renderSection();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "상품을 불러오지 못했어요.",
    );
  });
});
