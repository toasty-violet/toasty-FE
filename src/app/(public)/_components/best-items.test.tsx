import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import type { BestProduct } from "@/types/product";

import { BestItemSection } from "./BestItemSection";

const { getBestProductsMock } = vi.hoisted(() => ({
  getBestProductsMock: vi.fn(),
}));

vi.mock("@/lib/product-api", () => ({
  getBestProducts: getBestProductsMock,
}));

function bestProduct(overrides: Partial<BestProduct> = {}): BestProduct {
  return {
    productId: 11,
    shopName: "더플롯 빈티지",
    name: "체크 미디 스커트",
    price: 41000,
    imageUrl: "https://example.com/1.png",
    ...overrides,
  };
}

function renderSection() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <BestItemSection />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getBestProductsMock.mockReset();
});

describe("BestItemSection", () => {
  it("스토어명·상품명·가격을 상품 상세 링크로 묶어 보여준다", async () => {
    getBestProductsMock.mockResolvedValue([bestProduct()]);
    renderSection();

    expect(await screen.findByText("더플롯 빈티지")).toBeInTheDocument();
    expect(screen.getByText("41,000원")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /체크 미디 스커트/ }),
    ).toHaveAttribute("href", "/products/11");
  });

  // 서버가 스토어를 못 찾으면 null 로 오고, 그 줄만 빼고 그린다.
  it("스토어명이 없어도 카드를 그린다", async () => {
    getBestProductsMock.mockResolvedValue([bestProduct({ shopName: null })]);
    renderSection();

    expect(await screen.findByText("체크 미디 스커트")).toBeInTheDocument();
  });

  it("살 수 있는 상품이 없으면 제목까지 감춘다", async () => {
    getBestProductsMock.mockResolvedValue([]);
    renderSection();

    await vi.waitFor(() =>
      expect(screen.queryByText("베스트 아이템")).toBeNull(),
    );
  });

  it("조회에 실패해도 제목까지 감춘다", async () => {
    getBestProductsMock.mockRejectedValue(new Error("실패"));
    renderSection();

    await vi.waitFor(() =>
      expect(screen.queryByText("베스트 아이템")).toBeNull(),
    );
  });
});
