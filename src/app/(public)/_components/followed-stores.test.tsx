import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { type AuthStatus, useAuthStore } from "@/store/auth-store";
import type { FollowedStore } from "@/types/store";

import { FollowedStoreSection } from "./FollowedStoreSection";

const { getFollowedStoresMock } = vi.hoisted(() => ({
  getFollowedStoresMock: vi.fn(),
}));

vi.mock("@/lib/store-api", () => ({
  getFollowedStores: getFollowedStoresMock,
}));

function followedStore(overrides: Partial<FollowedStore> = {}): FollowedStore {
  return {
    sellerId: 7,
    shopName: "데일리 빈티지",
    shopImageUrl: "https://example.com/shop.png",
    products: [
      {
        productId: 11,
        name: "아이보리 골지 가디건",
        price: 29000,
        imageUrl: "https://example.com/1.png",
      },
    ],
    ...overrides,
  };
}

function renderSection(status: AuthStatus) {
  const loggedIn = status === "authed";

  useAuthStore.setState({
    status,
    accessToken: loggedIn ? "token" : null,
    isLoggedIn: loggedIn,
  });

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <FollowedStoreSection />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  getFollowedStoresMock.mockReset();
});

describe("FollowedStoreSection", () => {
  it("스토어가 1개면 1개만 렌더링한다", async () => {
    getFollowedStoresMock.mockResolvedValue([followedStore()]);
    renderSection("authed");

    expect(await screen.findByText("데일리 빈티지")).toBeInTheDocument();
    expect(screen.getByText("아이보리 골지 가디건")).toBeInTheDocument();
    expect(screen.getByText("29,000원")).toBeInTheDocument();
  });

  it("팔로우하는 스토어가 없으면 안내 문구만 보여준다", async () => {
    getFollowedStoresMock.mockResolvedValue([]);
    renderSection("authed");

    expect(
      await screen.findByText("팔로우하는 스토어가 없습니다."),
    ).toBeInTheDocument();
  });

  // 로그인해야 부를 수 있는 목록이라, 비로그인은 요청 없이 문구만 남는다.
  it("비로그인이면 요청하지 않고 안내 문구를 보여준다", () => {
    renderSection("guest");

    expect(
      screen.getByText("팔로우하는 스토어가 없습니다."),
    ).toBeInTheDocument();
    expect(getFollowedStoresMock).not.toHaveBeenCalled();
  });

  it("샵과 상품이 각각 스토어 페이지와 상품 상세로 연결된다", async () => {
    getFollowedStoresMock.mockResolvedValue([followedStore()]);
    renderSection("authed");

    const shopLink = await screen.findByRole("link", { name: "데일리 빈티지" });
    expect(shopLink).toHaveAttribute("href", "/shop/7");

    const productLink = screen.getByRole("link", {
      name: /아이보리 골지 가디건/,
    });
    expect(productLink).toHaveAttribute("href", "/shop/7/11");
  });
});
