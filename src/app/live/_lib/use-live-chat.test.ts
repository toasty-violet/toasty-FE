import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiRequestError } from "@/lib/api-error";
import { useAuthStore } from "@/store/auth-store";
import { LIVE_ERROR_CODE } from "@/types/live";

import { useLiveChat } from "./use-live-chat";

const { issueChatToken } = vi.hoisted(() => ({ issueChatToken: vi.fn() }));
vi.mock("./live-api", () => ({ issueChatToken }));

type Listener = (message: {
  id: string;
  content: string;
  sender: { attributes?: Record<string, string> };
}) => void;

const room = vi.hoisted(() => ({
  listeners: [] as Listener[],
  connect: vi.fn(),
  disconnect: vi.fn(),
  sendMessage: vi.fn(),
  tokenProvider: null as null | (() => Promise<unknown>),
}));

vi.mock("amazon-ivs-chat-messaging", () => ({
  ChatRoom: class {
    constructor(config: { tokenProvider: () => Promise<unknown> }) {
      room.tokenProvider = config.tokenProvider;
    }
    addListener(_: string, listener: Listener) {
      room.listeners.push(listener);
    }
    connect = room.connect;
    disconnect = room.disconnect;
    sendMessage = room.sendMessage;
  },
  SendMessageRequest: class {
    constructor(readonly content: string) {}
  },
}));

function receive(
  id: string,
  content: string,
  attributes?: Record<string, string>,
) {
  act(() => {
    room.listeners.forEach((l) => l({ id, content, sender: { attributes } }));
  });
}

beforeEach(() => {
  useAuthStore.setState({
    status: "guest",
    accessToken: null,
    isLoggedIn: false,
  });
  room.listeners = [];
  room.tokenProvider = null;
  vi.clearAllMocks();
  issueChatToken.mockResolvedValue({
    token: "t",
    expiresAt: "2026-09-11T00:00:00Z",
    writable: true,
  });
});

describe("useLiveChat", () => {
  it("아직 붙을 때가 아니면 토큰을 받지 않는다", () => {
    renderHook(() => useLiveChat({ publicId: "abc", enabled: false }));

    expect(issueChatToken).not.toHaveBeenCalled();
  });

  // 서버가 로그인 유저를 보고 쓰기 권한을 정한다. 부팅 중에 받으면 비로그인으로 찍힌다.
  it("로그인 여부가 확정되기 전에는 토큰을 받지 않는다", async () => {
    useAuthStore.setState({
      status: "loading",
      accessToken: null,
      isLoggedIn: false,
    });

    const { rerender } = renderHook(() =>
      useLiveChat({ publicId: "abc", enabled: true }),
    );
    expect(issueChatToken).not.toHaveBeenCalled();

    act(() => {
      useAuthStore.getState().setAccessToken("token");
    });
    rerender();

    await waitFor(() => expect(issueChatToken).toHaveBeenCalledTimes(1));
  });

  // 방송이 잠깐 끊겼다 이어지면 enabled 가 true → false → true 로 흔들린다.
  describe("다시 붙을 때", () => {
    const renderWithEnabled = () =>
      renderHook(({ enabled }) => useLiveChat({ publicId: "abc", enabled }), {
        initialProps: { enabled: true },
      });

    it("앞 연결에서 받은 메시지를 새 방에 이어 쌓지 않는다", async () => {
      const { result, rerender } = renderWithEnabled();
      await waitFor(() => expect(room.connect).toHaveBeenCalled());
      receive("1", "안녕하세요", { role: "CUSTOMER", displayName: "손님" });
      expect(result.current.messages).toHaveLength(1);

      rerender({ enabled: false });
      rerender({ enabled: true });

      expect(result.current.messages).toHaveLength(0);
    });

    // 되돌리지 않으면 방이 다시 생겨도 방송이 끝날 때까지 입력줄이 안 돌아온다.
    it("그때 방이 없었어도 다시 물어본다", async () => {
      issueChatToken.mockRejectedValueOnce(
        new ApiRequestError(LIVE_ERROR_CODE.CHAT_ROOM_NOT_FOUND, "없음", 404),
      );

      const { result, rerender } = renderWithEnabled();
      await waitFor(() => expect(result.current.unavailable).toBe(true));

      rerender({ enabled: false });
      rerender({ enabled: true });

      // unavailable 은 렌더 중에 되돌아가고 writable 은 새 토큰이 와야 참이 된다.
      // 늦게 정해지는 쪽을 기다려야 둘 다 본 것이 된다.
      await waitFor(() => expect(result.current.writable).toBe(true));
      expect(result.current.unavailable).toBe(false);
    });
  });

  // 서버가 끝난 방송의 채팅방을 회수하면 방이 없어진다.
  it("채팅방이 없으면 없다고 알린다", async () => {
    issueChatToken.mockRejectedValue(
      new ApiRequestError(LIVE_ERROR_CODE.CHAT_ROOM_NOT_FOUND, "없음", 404),
    );

    const { result } = renderHook(() =>
      useLiveChat({ publicId: "abc", enabled: true }),
    );

    await waitFor(() => expect(result.current.unavailable).toBe(true));
    expect(room.connect).not.toHaveBeenCalled();
  });

  it("받은 메시지를 보낸 사람과 함께 쌓는다", async () => {
    const { result } = renderHook(() =>
      useLiveChat({ publicId: "abc", enabled: true }),
    );

    await waitFor(() => expect(room.connect).toHaveBeenCalled());
    receive("1", "안녕하세요", { role: "SELLER", displayName: "토스티" });
    receive("2", "얼마예요", { role: "CUSTOMER", displayName: "손님" });

    expect(result.current.messages).toEqual([
      { id: "1", content: "안녕하세요", role: "SELLER", displayName: "토스티" },
      { id: "2", content: "얼마예요", role: "CUSTOMER", displayName: "손님" },
    ]);
  });

  // 비로그인은 서버가 이름을 싣지 않는다.
  it("이름이 없는 사람은 익명으로 둔다", async () => {
    const { result } = renderHook(() =>
      useLiveChat({ publicId: "abc", enabled: true }),
    );

    await waitFor(() => expect(room.connect).toHaveBeenCalled());
    receive("1", "안녕", { role: "GUEST" });

    expect(result.current.messages[0]).toMatchObject({
      role: "GUEST",
      displayName: "익명",
    });
  });

  it("읽기만 되는 토큰이면 쓰기를 열지 않는다", async () => {
    issueChatToken.mockResolvedValue({
      token: "t",
      expiresAt: "2026-09-11T00:00:00Z",
      writable: false,
    });

    const { result } = renderHook(() =>
      useLiveChat({ publicId: "abc", enabled: true }),
    );

    await waitFor(() => expect(room.connect).toHaveBeenCalled());
    expect(result.current.writable).toBe(false);
  });

  it("보낸 메시지를 채팅방에 넘긴다", async () => {
    const { result } = renderHook(() =>
      useLiveChat({ publicId: "abc", enabled: true }),
    );

    await waitFor(() => expect(room.connect).toHaveBeenCalled());
    await act(() => result.current.send("사고싶어요"));

    expect(room.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ content: "사고싶어요" }),
    );
  });

  // 연결이 끊겼거나 서버가 막으면 sendMessage 가 던진다.
  it("보내지 못하면 false 를 준다", async () => {
    room.sendMessage.mockRejectedValue(new Error("끊김"));
    const { result } = renderHook(() =>
      useLiveChat({ publicId: "abc", enabled: true }),
    );

    await waitFor(() => expect(room.connect).toHaveBeenCalled());
    let sent;
    await act(async () => {
      sent = await result.current.send("사고싶어요");
    });

    expect(sent).toBe(false);
  });

  // 세션이 끝날 무렵 SDK 가 tokenProvider 를 다시 부른다.
  it("첫 토큰은 다시 받지 않고, 그 다음부터 새로 받는다", async () => {
    renderHook(() => useLiveChat({ publicId: "abc", enabled: true }));
    await waitFor(() => expect(room.tokenProvider).not.toBeNull());

    expect(issueChatToken).toHaveBeenCalledTimes(1);
    await act(async () => {
      await room.tokenProvider?.();
    });
    expect(issueChatToken).toHaveBeenCalledTimes(1);

    await act(async () => {
      await room.tokenProvider?.();
    });
    expect(issueChatToken).toHaveBeenCalledTimes(2);
  });

  it("화면을 떠나면 채팅방을 끊는다", async () => {
    const { unmount } = renderHook(() =>
      useLiveChat({ publicId: "abc", enabled: true }),
    );

    await waitFor(() => expect(room.connect).toHaveBeenCalled());
    unmount();

    expect(room.disconnect).toHaveBeenCalled();
  });
});
