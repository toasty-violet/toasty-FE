import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { APP_FRAME_ID } from "@/components/overlays/app-frame";
import { useAuthStore } from "@/store/auth-store";
import type { AuthStatus } from "@/store/auth-store";

import { LiveViewer } from "./LiveViewer";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

// IVS 플레이어는 wasm 을 받아와 jsdom 에서 돌지 않는다.
vi.mock("./LivePlayer", () => ({ LivePlayer: () => null }));

vi.mock("@/app/live/_lib/live-api", () => ({
  getLive: vi.fn(async () => ({
    title: "첫 방송",
    seller: { shopName: "토스티", shopImageUrl: "" },
  })),
  getLivePlayback: vi.fn(async () => ({
    status: "LIVE",
    playbackUrl: "https://example.test/live.m3u8",
  })),
  getViewerCount: vi.fn(async () => 12),
  getPublicLiveProducts: vi.fn(async () => ({
    currentPinnedProductId: 1,
    products: [
      {
        liveProductId: 1,
        productId: 1,
        name: "상품 1",
        price: 32000,
        stockQuantity: 5,
        imageUrl: "/image.png",
        displayOrder: 1,
        status: "ACTIVE",
      },
    ],
  })),
}));

function renderViewer(status: AuthStatus) {
  useAuthStore.setState({
    status,
    accessToken: status === "authed" ? "token" : null,
    isLoggedIn: status === "authed",
  });
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <LiveViewer publicId="abc" />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  const frame = document.createElement("div");
  frame.id = APP_FRAME_ID;
  document.body.append(frame);
});

describe("LiveViewer 구매 잠금", () => {
  // loading 을 로그인으로 보면 비로그인에게도 구매가 잠깐 열렸다가 잠긴다.
  it("로그인 여부가 확정되기 전에는 구매를 열지 않는다", async () => {
    renderViewer("loading");

    expect(
      await screen.findByRole("button", { name: "구매하기" }),
    ).toBeDisabled();
    // 아직 비로그인이 확정된 게 아니라 로그인 안내는 띄우지 않는다.
    expect(screen.queryByText("로그인 후 상품 구매가 가능해요.")).toBeNull();
  });

  it("비로그인이 확정되면 구매를 잠그고 로그인으로 안내한다", async () => {
    renderViewer("guest");

    expect(
      await screen.findByRole("button", { name: "구매하기" }),
    ).toBeDisabled();
    expect(
      screen.getByText("로그인 후 상품 구매가 가능해요."),
    ).toBeInTheDocument();
  });

  it("로그인했으면 구매를 연다", async () => {
    renderViewer("authed");

    expect(
      await screen.findByRole("button", { name: "구매하기" }),
    ).toBeEnabled();
  });
});
