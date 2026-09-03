import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouteGuard } from "./RouteGuard";
import { useAuthStore } from "@/store/auth-store";
import { useUserStore } from "@/store/user-store";
import type { User } from "@/types/user";

const replaceMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

function setState(status: "loading" | "authed" | "guest", user: User | null) {
  useAuthStore.setState({
    status,
    accessToken: status === "authed" ? "token" : null,
    isLoggedIn: status === "authed",
  });
  useUserStore.setState({ user });
}

beforeEach(() => {
  replaceMock.mockClear();
});

describe("RouteGuard", () => {
  it("부팅 중에는 아무 데도 보내지 않고 children 도 감춘다", () => {
    setState("loading", null);
    render(
      <RouteGuard require="SELLER">
        <p>스튜디오</p>
      </RouteGuard>,
    );

    expect(screen.queryByText("스튜디오")).not.toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  // 토큰은 먼저 들어오고 /users/me 는 뒤에 온다. 이 구간을 판정 완료로 보면 권한자가 쫓겨난다
  it("토큰만 있고 유저 정보가 아직 없으면 이동시키지 않는다", () => {
    setState("authed", null);
    render(
      <RouteGuard require="SELLER">
        <p>스튜디오</p>
      </RouteGuard>,
    );

    expect(screen.queryByText("스튜디오")).not.toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("역할이 맞으면 children 을 보여준다", () => {
    setState("authed", { role: "SELLER", nickname: "셀러" });
    render(
      <RouteGuard require="SELLER">
        <p>스튜디오</p>
      </RouteGuard>,
    );

    expect(screen.getByText("스튜디오")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("역할이 다르면 홈으로 보내고 children 을 그리지 않는다", () => {
    setState("authed", { role: "CUSTOMER", nickname: "구매자" });
    render(
      <RouteGuard require="SELLER">
        <p>스튜디오</p>
      </RouteGuard>,
    );

    expect(screen.queryByText("스튜디오")).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/");
  });

  it("비로그인이면 로그인 페이지로 보낸다", () => {
    setState("guest", null);
    render(
      <RouteGuard require="SELLER">
        <p>스튜디오</p>
      </RouteGuard>,
    );

    expect(screen.queryByText("스튜디오")).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/login");
  });
});
