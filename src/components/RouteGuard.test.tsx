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

  // /me 같은 CUSTOMER 전용 화면에 셀러가 들어오면 홈을 거치지 않고 바로 제 화면으로 보낸다
  it("SELLER 가 CUSTOMER 전용 화면에 오면 /shop 으로 바로 보낸다", () => {
    setState("authed", { role: "SELLER", nickname: "셀러" });
    render(
      <RouteGuard require="CUSTOMER">
        <p>마이페이지</p>
      </RouteGuard>,
    );

    expect(screen.queryByText("마이페이지")).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/shop");
  });

  it("비로그인이 CUSTOMER 전용 화면에 오면 /login 으로 보낸다", () => {
    setState("guest", null);
    render(
      <RouteGuard require="CUSTOMER">
        <p>마이페이지</p>
      </RouteGuard>,
    );

    expect(screen.queryByText("마이페이지")).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/login");
  });

  it("CUSTOMER 는 CUSTOMER 전용 화면을 볼 수 있다", () => {
    setState("authed", { role: "CUSTOMER", nickname: "구매자" });
    render(
      <RouteGuard require="CUSTOMER">
        <p>마이페이지</p>
      </RouteGuard>,
    );

    expect(screen.getByText("마이페이지")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  // 역할 미선택 유저가 권한 화면에 오면 홈이 아니라 역할 선택으로 보낸다
  it("역할 미선택 유저는 /select-role 로 보낸다", () => {
    setState("authed", { nickname: "신규" });
    render(
      <RouteGuard require="SELLER">
        <p>스튜디오</p>
      </RouteGuard>,
    );

    expect(screen.queryByText("스튜디오")).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/select-role");
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

  // 로그인 화면은 반대로 비로그인이어야 통과한다
  it("guest 는 비로그인 유저에게 children 을 보여준다", () => {
    setState("guest", null);
    render(
      <RouteGuard require="guest">
        <p>로그인 화면</p>
      </RouteGuard>,
    );

    expect(screen.getByText("로그인 화면")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  // 로그인한 채로 /login 에 오면 /login 으로 되돌리는 무한 루프가 나면 안 된다
  it("guest 는 이미 로그인한 유저를 제 역할의 화면으로 보낸다", () => {
    setState("authed", { role: "SELLER", nickname: "셀러" });
    render(
      <RouteGuard require="guest">
        <p>로그인 화면</p>
      </RouteGuard>,
    );

    expect(screen.queryByText("로그인 화면")).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/shop");
  });

  it("guest 는 CUSTOMER 를 홈으로 보낸다", () => {
    setState("authed", { role: "CUSTOMER", nickname: "구매자" });
    render(
      <RouteGuard require="guest">
        <p>로그인 화면</p>
      </RouteGuard>,
    );

    expect(screen.queryByText("로그인 화면")).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/");
  });

  // require="authed" 는 역할을 따지지 않고 로그인 여부만 본다
  it("authed 는 역할이 무엇이든 children 을 보여준다", () => {
    setState("authed", { role: "CUSTOMER", nickname: "구매자" });
    render(
      <RouteGuard require="authed">
        <p>보호 화면</p>
      </RouteGuard>,
    );

    expect(screen.getByText("보호 화면")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("authed 라도 비로그인이면 로그인 페이지로 보낸다", () => {
    setState("guest", null);
    render(
      <RouteGuard require="authed">
        <p>보호 화면</p>
      </RouteGuard>,
    );

    expect(screen.queryByText("보호 화면")).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/login");
  });

  // 역할 미선택 유저는 role 키 자체가 없어 undefined 로 들어온다
  it("onboarding 은 역할 미선택 유저에게 children 을 보여준다", () => {
    setState("authed", { nickname: "신규" });
    render(
      <RouteGuard require="onboarding">
        <p>역할 선택</p>
      </RouteGuard>,
    );

    expect(screen.getByText("역할 선택")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  // 이미 역할을 고른 사람이 /select-role 에 다시 오면 제 역할의 화면으로 되돌려보낸다
  it("onboarding 은 이미 역할이 있는 유저를 제 화면으로 보낸다", () => {
    setState("authed", { role: "SELLER", nickname: "셀러" });
    render(
      <RouteGuard require="onboarding">
        <p>역할 선택</p>
      </RouteGuard>,
    );

    expect(screen.queryByText("역할 선택")).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/shop");
  });
});
