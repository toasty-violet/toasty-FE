import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNicknameCheck } from "./use-nickname-check";

const fetchNicknameDuplicated = vi.hoisted(() => vi.fn());

vi.mock("@/lib/user", () => ({ fetchNicknameDuplicated }));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/** 디바운스 타이머를 흘려보낸다. */
const passDebounce = () =>
  act(() => {
    vi.advanceTimersByTime(500);
  });

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  fetchNicknameDuplicated.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useNicknameCheck", () => {
  it("형식이 틀리면 조회하지 않고 형식 에러만 알린다", async () => {
    const { result, rerender } = renderHook(
      ({ nickname }) => useNicknameCheck(nickname),
      { wrapper, initialProps: { nickname: "" } },
    );

    rerender({ nickname: "가" });
    passDebounce();

    expect(fetchNicknameDuplicated).not.toHaveBeenCalled();
    expect(result.current.error).toBe(true);
    expect(result.current.errorMessage).toBe(
      "한글, 영문, 숫자 2~20자로 입력해 주세요.",
    );
    expect(result.current.verified).toBe(false);
  });

  it("중복이 아니면 사용 가능 문구를 띄우고 제출을 허용한다", async () => {
    fetchNicknameDuplicated.mockResolvedValue(false);
    const { result, rerender } = renderHook(
      ({ nickname }) => useNicknameCheck(nickname),
      { wrapper, initialProps: { nickname: "" } },
    );

    rerender({ nickname: "토스티유저" });
    passDebounce();

    await waitFor(() => expect(result.current.success).toBe(true));
    expect(result.current.successMessage).toBe("사용 가능한 닉네임이에요.");
    expect(result.current.error).toBe(false);
    expect(result.current.verified).toBe(true);
  });

  it("중복이면 에러 문구를 띄우고 제출을 막는다", async () => {
    fetchNicknameDuplicated.mockResolvedValue(true);
    const { result, rerender } = renderHook(
      ({ nickname }) => useNicknameCheck(nickname),
      { wrapper, initialProps: { nickname: "" } },
    );

    rerender({ nickname: "토스티" });
    passDebounce();

    await waitFor(() => expect(result.current.error).toBe(true));
    expect(result.current.errorMessage).toBe("이미 사용 중인 닉네임이에요.");
    expect(result.current.success).toBe(false);
    expect(result.current.verified).toBe(false);
  });

  it("입력이 멈춘 뒤 마지막 값으로 한 번만 조회한다", async () => {
    fetchNicknameDuplicated.mockResolvedValue(false);
    const { rerender } = renderHook(
      ({ nickname }) => useNicknameCheck(nickname),
      { wrapper, initialProps: { nickname: "" } },
    );

    rerender({ nickname: "토스" });
    rerender({ nickname: "토스티" });
    rerender({ nickname: "토스티유" });
    passDebounce();

    await waitFor(() =>
      expect(fetchNicknameDuplicated).toHaveBeenCalledTimes(1),
    );
    expect(fetchNicknameDuplicated).toHaveBeenCalledWith("토스티유");
  });

  it("닉네임을 채운 채 시작하면 고치기 전까지 조회하지 않는다", async () => {
    fetchNicknameDuplicated.mockResolvedValue(false);
    renderHook(() => useNicknameCheck("기존닉네임"), { wrapper });

    passDebounce();

    expect(fetchNicknameDuplicated).not.toHaveBeenCalled();
  });

  it("조회를 마친 뒤 값을 고치면 이전 결과를 지운다", async () => {
    fetchNicknameDuplicated.mockResolvedValue(false);
    const { result, rerender } = renderHook(
      ({ nickname }) => useNicknameCheck(nickname),
      { wrapper, initialProps: { nickname: "" } },
    );

    rerender({ nickname: "토스티유저" });
    passDebounce();
    await waitFor(() => expect(result.current.success).toBe(true));

    rerender({ nickname: "토스티유저2" });

    expect(result.current.success).toBe(false);
    expect(result.current.verified).toBe(false);
  });
});
