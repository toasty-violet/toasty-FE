import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth-store";
import type { TopStore } from "@/types/store";

import { StoreTop3Section } from "./StoreTop3Section";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const { getTopStoresMock, followStoreMock, unfollowStoreMock } = vi.hoisted(
  () => ({
    getTopStoresMock: vi.fn(),
    followStoreMock: vi.fn(),
    unfollowStoreMock: vi.fn(),
  }),
);

vi.mock("@/lib/store-api", () => ({
  getTopStores: getTopStoresMock,
  followStore: followStoreMock,
  unfollowStore: unfollowStoreMock,
}));

function store(overrides: Partial<TopStore> = {}): TopStore {
  return {
    sellerId: 1,
    shopName: "데일리 빈티지",
    shopImageUrl: "https://example.com/1.png",
    followerCount: 1240,
    productCount: 98,
    following: false,
    ...overrides,
  };
}

function renderSection(loggedIn: boolean) {
  useAuthStore.setState({
    status: loggedIn ? "authed" : "guest",
    accessToken: loggedIn ? "token" : null,
    isLoggedIn: loggedIn,
  });

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <StoreTop3Section />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  pushMock.mockClear();
  followStoreMock.mockReset().mockResolvedValue(undefined);
  unfollowStoreMock.mockReset().mockResolvedValue(undefined);
  getTopStoresMock.mockReset();
});

describe("StoreTop3Section", () => {
  it("로딩 중에는 스켈레톤 3줄을 보여준다", () => {
    getTopStoresMock.mockReturnValue(new Promise(() => {}));
    const { container } = renderSection(false);

    expect(container.querySelectorAll("li")).toHaveLength(3);
    expect(screen.queryByText("데일리 빈티지")).not.toBeInTheDocument();
  });

  // 스토어가 3개가 안 되면 받은 만큼만 그린다
  it("스토어가 1개면 1개만 렌더링한다", async () => {
    getTopStoresMock.mockResolvedValue([store()]);
    const { container } = renderSection(false);

    expect(await screen.findByText("데일리 빈티지")).toBeInTheDocument();
    expect(container.querySelectorAll("li")).toHaveLength(1);
    expect(screen.getByText("팔로워 1,240 · 상품 98")).toBeInTheDocument();
  });

  // 제목은 페이지가 서버에서 그리므로 목록만 사라진다.
  it("목록이 비면 아무것도 그리지 않는다", async () => {
    getTopStoresMock.mockResolvedValue([]);
    const { container } = renderSection(false);

    await waitFor(() =>
      expect(container.querySelector("ul")).not.toBeInTheDocument(),
    );
  });

  it("비로그인 유저가 팔로우를 누르면 요청 없이 로그인으로 보낸다", async () => {
    getTopStoresMock.mockResolvedValue([store()]);
    renderSection(false);

    await userEvent.click(
      await screen.findByRole("button", { name: "팔로우" }),
    );

    expect(pushMock).toHaveBeenCalledWith("/login");
    expect(followStoreMock).not.toHaveBeenCalled();
  });

  it("팔로우를 누르면 버튼과 팔로워 수가 즉시 바뀐다", async () => {
    getTopStoresMock.mockResolvedValue([store()]);
    renderSection(true);

    await userEvent.click(
      await screen.findByRole("button", { name: "팔로우" }),
    );

    expect(followStoreMock).toHaveBeenCalledWith(1);
    expect(await screen.findByRole("button", { name: "팔로잉" })).toBeVisible();
    expect(screen.getByText("팔로워 1,241 · 상품 98")).toBeInTheDocument();
  });

  it("팔로잉을 누르면 언팔로우를 보낸다", async () => {
    getTopStoresMock.mockResolvedValue([store({ following: true })]);
    renderSection(true);

    await userEvent.click(
      await screen.findByRole("button", { name: "팔로잉" }),
    );

    expect(unfollowStoreMock).toHaveBeenCalledWith(1);
    expect(await screen.findByRole("button", { name: "팔로우" })).toBeVisible();
    expect(screen.getByText("팔로워 1,239 · 상품 98")).toBeInTheDocument();
  });

  it("요청이 실패하면 누르기 전 상태로 되돌린다", async () => {
    getTopStoresMock.mockResolvedValue([store()]);
    followStoreMock.mockRejectedValue(new Error("실패"));
    renderSection(true);

    await userEvent.click(
      await screen.findByRole("button", { name: "팔로우" }),
    );

    expect(await screen.findByRole("button", { name: "팔로우" })).toBeVisible();
    expect(screen.getByText("팔로워 1,240 · 상품 98")).toBeInTheDocument();
  });
});
