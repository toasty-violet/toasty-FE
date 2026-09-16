import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth-store";
import type { ProductDetail } from "@/types/product";
import type { SellerProfile } from "@/types/store";

import { ProductDetailScreen } from "./ProductDetailScreen";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const { getProductMock, getSellerProfileMock, followStoreMock } = vi.hoisted(
  () => ({
    getProductMock: vi.fn(),
    getSellerProfileMock: vi.fn(),
    followStoreMock: vi.fn(),
  }),
);

vi.mock("@/lib/product-api", () => ({ getProduct: getProductMock }));
vi.mock("@/lib/store-api", () => ({
  getSellerProfile: getSellerProfileMock,
  followStore: followStoreMock,
  unfollowStore: vi.fn(),
}));

function product(overrides: Partial<ProductDetail> = {}): ProductDetail {
  return {
    productId: 11,
    sellerId: 7,
    name: "아이보리 골지 가디건",
    price: 29000,
    description: "부드러운 소재가 매력적인 가디건\nSize FREE",
    imageUrls: ["https://example.com/1.png", "https://example.com/2.png"],
    otherProducts: [
      {
        productId: 12,
        name: "데님 자켓",
        price: 36000,
        imageUrl: "https://example.com/3.png",
      },
    ],
    shippingFee: { baseShippingFee: 3000, freeShippingThreshold: 0 },
    ...overrides,
  };
}

const profile: SellerProfile = {
  sellerId: 7,
  shopImageUrl: null,
  shopName: "토스티샵",
  followerCount: 240,
  productCount: 38,
  description: "예쁜 빈티지 옷들",
  following: false,
};

function renderScreen() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <ProductDetailScreen productId={11} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  useAuthStore.setState({
    status: "authed",
    accessToken: "token",
    isLoggedIn: true,
  });
  pushMock.mockReset();
  getProductMock.mockReset();
  followStoreMock.mockReset();
  getSellerProfileMock.mockReset();
  getSellerProfileMock.mockResolvedValue(profile);
});

describe("ProductDetailScreen", () => {
  it("상품명·가격·설명과 스토어를 보여준다", async () => {
    getProductMock.mockResolvedValue(product());
    renderScreen();

    expect(await screen.findByText("아이보리 골지 가디건")).toBeInTheDocument();
    expect(screen.getByText("29,000원")).toBeInTheDocument();
    expect(screen.getByText(/부드러운 소재가 매력적인 가디건/)).toBeVisible();
    expect(await screen.findByText("토스티샵")).toBeInTheDocument();
    // 상세는 화면 한 번에 한 번만 부른다. 부를 때마다 조회수가 오른다.
    expect(getProductMock).toHaveBeenCalledTimes(1);
  });

  it("사진이 여러 장이면 몇 번째인지 알린다", async () => {
    getProductMock.mockResolvedValue(product());
    renderScreen();

    expect(await screen.findByText("/ 2")).toBeInTheDocument();
  });

  it("다른 상품은 스토어 이름을 달고 상품 상세로 연결된다", async () => {
    getProductMock.mockResolvedValue(product());
    renderScreen();

    expect(await screen.findByText("토스티샵의 다른 상품")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /데님 자켓/ })).toHaveAttribute(
      "href",
      "/products/12",
    );
  });

  it("다른 상품이 없으면 그 줄을 두지 않는다", async () => {
    getProductMock.mockResolvedValue(product({ otherProducts: [] }));
    renderScreen();

    expect(await screen.findByText("아이보리 골지 가디건")).toBeInTheDocument();
    expect(screen.queryByText(/다른 상품/)).toBeNull();
  });

  it("구매하기는 결제 화면으로 상품을 실어 보낸다", async () => {
    getProductMock.mockResolvedValue(product());
    renderScreen();

    await userEvent.click(
      await screen.findByRole("button", { name: "구매하기" }),
    );
    expect(pushMock).toHaveBeenCalledWith("/products/payments?productId=11");
  });

  it("팔로우를 누르면 스토어를 팔로우한다", async () => {
    getProductMock.mockResolvedValue(product());
    renderScreen();

    await userEvent.click(
      await screen.findByRole("button", { name: "팔로우" }),
    );
    expect(followStoreMock).toHaveBeenCalledWith(7);
  });

  it("열 수 없는 상품이면 그렇게 알린다", async () => {
    getProductMock.mockRejectedValue(new Error("404"));
    renderScreen();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "상품을 불러오지 못했어요.",
    );
  });
});
