import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { APP_FRAME_ID } from "./app-frame";
import { PaymentDoneModal } from "./PaymentDoneModal";

// 모달은 앱 프레임으로 포털해 붙는다. jsdom 에는 그 요소가 없어 만들어 준다.
beforeEach(() => {
  const frame = document.createElement("div");
  frame.id = APP_FRAME_ID;
  document.body.append(frame);
});

describe("PaymentDoneModal", () => {
  it("닫혀 있으면 아무것도 그리지 않는다", () => {
    render(<PaymentDoneModal open={false} onClose={() => {}} />);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("결제 완료와 배송비 환불 안내를 보여준다", () => {
    render(<PaymentDoneModal open onClose={() => {}} />);

    expect(
      screen.getByRole("dialog", { name: "결제가 완료되었습니다" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/10만 원 이상 구매 시/)).toBeInTheDocument();
  });

  it("확인을 누르면 닫는다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<PaymentDoneModal open onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(onClose).toHaveBeenCalled();
  });
});
