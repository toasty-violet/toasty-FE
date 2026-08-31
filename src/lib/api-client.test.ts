import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  postMock,
  apiGetMock,
  requestHandlers,
  responseHandlers,
  createdCount,
} = vi.hoisted(() => ({
  postMock: vi.fn(),
  apiGetMock: vi.fn(),
  requestHandlers: [] as Array<(config: unknown) => unknown>,
  responseHandlers: [] as Array<(error: unknown) => unknown>,
  // vi.resetModules()로 모듈을 다시 불러올 때마다 0부터 세야 첫 인스턴스가 apiClient가 된다
  createdCount: { value: 0 },
}));

// apiClient(originalRequest) 재시도 호출을 가로채기 위해 호출 가능한 함수형 인스턴스로 목킹
vi.mock("axios", () => {
  const makeInstance = (isApiClient: boolean) => {
    const instance = isApiClient
      ? (config: unknown) => apiGetMock(config)
      : ({} as Record<string, unknown>);
    Object.assign(instance, {
      post: postMock,
      interceptors: {
        request: {
          use: (fn: (config: unknown) => unknown) => requestHandlers.push(fn),
        },
        response: {
          use: (_ok: unknown, err: (error: unknown) => unknown) =>
            responseHandlers.push(err),
        },
      },
    });
    return instance;
  };
  return {
    default: { create: () => makeInstance(createdCount.value++ === 0) },
    AxiosError: class extends Error {},
  };
});

async function loadClient() {
  vi.resetModules();
  requestHandlers.length = 0;
  responseHandlers.length = 0;
  createdCount.value = 0;
  const mod = await import("./api-client");
  const store = (await import("@/store/auth-store")).useAuthStore;
  store.getState().clearAuth();
  return { ...mod, store, onRejected: responseHandlers[0] };
}

function unauthorized(url: string, tokenUsed?: string) {
  return {
    response: { status: 401 },
    config: { url, headers: {} as Record<string, string>, _tokenUsed: tokenUsed },
  };
}

beforeEach(() => {
  postMock.mockReset();
  apiGetMock.mockReset().mockResolvedValue({ data: "ok" });
  vi.stubGlobal("window", { location: { assign: vi.fn() } });
});

afterEach(() => vi.unstubAllGlobals());

describe("토큰 재발급 직렬화", () => {
  it("동시에 들어온 401 3개가 /refresh를 한 번만 호출한다", async () => {
    const { onRejected, store } = await loadClient();
    store.getState().setAccessToken("old");

    let resolveRefresh!: (v: unknown) => void;
    postMock.mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    const inflight = ["/a", "/b", "/c"].map((url) =>
      onRejected(unauthorized(url, "old")),
    );
    await Promise.resolve();

    resolveRefresh({
      data: { success: true, data: { accessToken: "new" }, error: null },
    });
    await Promise.all(inflight);

    expect(postMock).toHaveBeenCalledTimes(1);
    expect(store.getState().accessToken).toBe("new");
    // 세 요청 모두 새 토큰으로 재시도됐는지 확인
    expect(apiGetMock).toHaveBeenCalledTimes(3);
    for (const [config] of apiGetMock.mock.calls) {
      expect(config.headers.Authorization).toBe("Bearer new");
    }
  });

  it("재발급 완료 후 도착한 구식 토큰 401은 refresh 없이 재시도한다", async () => {
    const { onRejected, store } = await loadClient();
    store.getState().setAccessToken("new");

    await onRejected(unauthorized("/late", "old"));

    expect(postMock).not.toHaveBeenCalled();
    expect(apiGetMock.mock.calls[0][0].headers.Authorization).toBe("Bearer new");
  });

  it("재발급 실패 시 로그아웃 리다이렉트는 한 번만 실행된다", async () => {
    const { onRejected, store } = await loadClient();
    store.getState().setAccessToken("old");
    postMock.mockRejectedValue(new Error("rotation reuse detected"));

    const results = await Promise.allSettled(
      ["/a", "/b", "/c"].map((url) => onRejected(unauthorized(url, "old"))),
    );

    expect(results.every((r) => r.status === "rejected")).toBe(true);
    expect(store.getState().accessToken).toBeNull();
    expect(window.location.assign).toHaveBeenCalledTimes(1);
  });

  it("/login/kakao의 401은 재발급을 타지 않고 그대로 콜백 페이지로 전달된다", async () => {
    const { onRejected, store } = await loadClient();
    const original = unauthorized("/login/kakao");

    await expect(onRejected(original)).rejects.toBe(original);

    expect(postMock).not.toHaveBeenCalled();
    expect(store.getState().accessToken).toBeNull();
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it("실패한 재발급 이후의 401은 다시 /refresh를 시도할 수 있다", async () => {
    const { requestRefresh } = await loadClient();
    postMock.mockRejectedValueOnce(new Error("일시 실패"));
    await expect(requestRefresh()).rejects.toThrow("일시 실패");

    postMock.mockResolvedValueOnce({
      data: { success: true, data: { accessToken: "second" }, error: null },
    });
    await expect(requestRefresh()).resolves.toBe("second");
    expect(postMock).toHaveBeenCalledTimes(2);
  });
});
