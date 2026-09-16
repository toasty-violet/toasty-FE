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

  // 비로그인에도 서버가 스토어를 채워 주므로, 요청해서 받은 만큼 그린다.
  it("비로그인이어도 서버가 채워 준 스토어를 보여준다", async () => {
    getFollowedStoresMock.mockResolvedValue([followedStore()]);
    renderSection("guest");

    expect(await screen.findByText("데일리 빈티지")).toBeInTheDocument();
    expect(getFollowedStoresMock).toHaveBeenCalled();
  });

  // 인증이 확정되기 전에 보내면 팔로우한 스토어 대신 채워 넣은 스토어가 온다.
  it("인증이 확정되기 전에는 요청하지 않는다", () => {
    renderSection("loading");

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
    expect(productLink).toHaveAttribute("href", "/products/11");
  });
});
