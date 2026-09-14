import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ChatMessageView } from "@/app/live/_lib/use-live-chat";

import { LiveChatInput } from "./LiveChatInput";
import { LiveChatOverlay } from "./LiveChatOverlay";

const message = (over: Partial<ChatMessageView> & { id: string }) => ({
  content: "안녕하세요",
  role: "CUSTOMER" as const,
  displayName: "손님",
  ...over,
});

describe("LiveChatOverlay", () => {
  it("받은 순서대로 이름과 내용을 보여준다", () => {
    render(
      <LiveChatOverlay
        messages={[
          message({ id: "1", displayName: "소여니", content: "사장님 안녕" }),
          message({ id: "2", displayName: "minji", content: "우와~!" }),
        ]}
      />,
    );

    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("소여니사장님 안녕");
    expect(rows[1]).toHaveTextContent("minji우와~!");
  });

  // 셀러 말은 색으로 구분한다.
  it("셀러가 보낸 말은 다른 색으로 둔다", () => {
    render(
      <LiveChatOverlay
        messages={[
          message({ id: "1", role: "SELLER", displayName: "토스티샵" }),
          message({ id: "2", role: "CUSTOMER" }),
        ]}
      />,
    );

    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveStyle({ color: "#fdae9b" });
    expect(rows[1]).not.toHaveStyle({ color: "#fdae9b" });
  });

  it("아직 말이 없으면 아무것도 그리지 않는다", () => {
    render(<LiveChatOverlay messages={[]} />);

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});

const sends = (ok = true) => vi.fn(async () => ok);

describe("LiveChatInput", () => {
  it("적기 전에는 전송 버튼을 두지 않는다", () => {
    render(<LiveChatInput onSend={sends()} />);

    expect(screen.queryByRole("button", { name: "전송" })).toBeNull();
  });

  it("적은 말을 보내고 입력줄을 비운다", async () => {
    const onSend = sends();
    render(<LiveChatInput onSend={onSend} />);
    const input = screen.getByRole("textbox", { name: "채팅 입력" });

    await userEvent.type(input, "사고싶어요");
    await userEvent.click(screen.getByRole("button", { name: "전송" }));

    expect(onSend).toHaveBeenCalledWith("사고싶어요");
    expect(input).toHaveValue("");
  });

  // 공백만 보내면 채팅방에 빈 줄이 남는다.
  it("공백만 있으면 보내지 않는다", async () => {
    const onSend = sends();
    render(<LiveChatInput onSend={onSend} />);

    await userEvent.type(
      screen.getByRole("textbox", { name: "채팅 입력" }),
      "   ",
    );

    expect(screen.queryByRole("button", { name: "전송" })).toBeNull();
    expect(onSend).not.toHaveBeenCalled();
  });

  // 연결이 끊겼는데 지워버리면 적은 글을 잃는다.
  it("보내지 못했으면 적은 글을 남긴다", async () => {
    render(<LiveChatInput onSend={sends(false)} />);
    const input = screen.getByRole("textbox", { name: "채팅 입력" });

    await userEvent.type(input, "사고싶어요");
    await userEvent.click(screen.getByRole("button", { name: "전송" }));

    expect(input).toHaveValue("사고싶어요");
  });

  it("보낼 수 없는 사람에게는 입력줄을 잠근다", () => {
    render(<LiveChatInput disabled onSend={sends()} />);

    expect(screen.getByRole("textbox", { name: "채팅 입력" })).toBeDisabled();
  });
});
