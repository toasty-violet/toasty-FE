import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { APP_FRAME_ID } from "@/components/overlays/app-frame";
import { ApiRequestError } from "@/lib/api-error";
import { useAuthStore } from "@/store/auth-store";
import type { AuthStatus } from "@/store/auth-store";
import { LIVE_ERROR_CODE } from "@/types/live";

import { LiveViewer } from "./LiveViewer";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

// IVS 플레이어는 wasm 을 받아와 jsdom 에서 돌지 않는다.
vi.mock("./LivePlayer", () => ({ LivePlayer: () => null }));

// 채팅은 웹소켓을 열어 jsdom 에서 붙지 않는다. 방을 흉내만 낸다.
vi.mock("amazon-ivs-chat-messaging", () => ({
  ChatRoom: class {
    addListener() {}
    connect() {}
    disconnect() {}
  },
  SendMessageRequest: class {},
}));

const { issueChatToken } = vi.hoisted(() => ({ issueChatToken: vi.fn() }));

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
  issueChatToken,
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
  issueChatToken.mockResolvedValue({
    token: "t",
    expiresAt: "2026-09-11T01:00:00Z",
    writable: true,
  });
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

describe("LiveViewer 채팅", () => {
  it("방송 중이면 채팅 입력줄을 둔다", async () => {
    renderViewer("authed");

    expect(
      await screen.findByRole("textbox", { name: "채팅 입력" }),
    ).toBeEnabled();
  });

  // 비로그인과 끝난 방송은 서버가 읽기 전용 토큰을 준다.
  it("읽기 전용 토큰이면 입력줄을 잠근다", async () => {
    issueChatToken.mockResolvedValue({
      token: "t",
      expiresAt: "2026-09-11T01:00:00Z",
      writable: false,
    });

    renderViewer("guest");

    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "채팅 입력" })).toBeDisabled(),
    );
  });
});

// 마이그레이션 전에 만들어진 라이브와 방을 회수당한 라이브는 채팅방이 없다.
describe("LiveViewer 채팅방이 없을 때", () => {
  const noRoom = () =>
    issueChatToken.mockRejectedValue(
      new ApiRequestError(LIVE_ERROR_CODE.CHAT_ROOM_NOT_FOUND, "없음", 404),
    );

  it("붙을 수 없는 입력줄을 두지 않는다", async () => {
    noRoom();
    renderViewer("authed");

    await screen.findByRole("button", { name: "구매하기" });
    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: "채팅 입력" })).toBeNull(),
    );
  });

  // 입력줄이 사라져도 구매 안내는 남아야 한다.
  it("비로그인 안내는 그대로 보여준다", async () => {
    noRoom();
    renderViewer("guest");

    // 화면이 그려진 뒤에 봐야 한다. 아직 불러오는 중이면 무엇도 없어 그냥 통과한다.
    await screen.findByRole("button", { name: "구매하기" });
    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: "채팅 입력" })).toBeNull(),
    );
    // 겹칠 입력줄이 없으니 제 줄로 나와야 한다. 겹친 채로 두면 화면에서 사라진다.
    expect(screen.getByText("로그인 후 상품 구매가 가능해요.")).not.toHaveClass(
      "absolute",
    );
  });
});
