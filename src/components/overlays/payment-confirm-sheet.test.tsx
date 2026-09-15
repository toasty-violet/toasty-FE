import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { APP_FRAME_ID } from "./app-frame";
import { PaymentConfirmSheet, SHIPPING_FEE } from "./PaymentConfirmSheet";

const PRICE = 32000;
const won = (amount: number) => `${amount.toLocaleString("ko-KR")}원`;

// 시트는 앱 프레임으로 포털해 붙는다. jsdom 에는 그 요소가 없어 만들어 준다.
beforeEach(() => {
  const frame = document.createElement("div");
  frame.id = APP_FRAME_ID;
  document.body.append(frame);
});

describe("PaymentConfirmSheet", () => {
  it("닫혀 있으면 아무것도 그리지 않는다", () => {
    render(
      <PaymentConfirmSheet
        open={false}
        price={32000}
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  // 배송비가 0 이면 상품 금액과 총액이 같은 문구가 되므로 개수로 확인한다.
  it("상품 금액에 배송비를 더해 총액을 낸다", () => {
    render(
      <PaymentConfirmSheet
        open
        price={PRICE}
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "결제 전 확인해주세요" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText(won(PRICE)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(won(SHIPPING_FEE)).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(won(PRICE + SHIPPING_FEE)).length,
    ).toBeGreaterThan(0);
  });

  it("5분 제한을 안내한다", () => {
    render(
      <PaymentConfirmSheet
        open
        price={32000}
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );

    expect(
      screen.getByText(/5분 내 결제를 완료하지 않으면/),
    ).toBeInTheDocument();
  });

  it("결제하기를 누르면 확인을 알린다", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <PaymentConfirmSheet
        open
        price={32000}
        onClose={() => {}}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "결제하기" }));

    expect(onConfirm).toHaveBeenCalled();
  });

  it("취소를 누르면 닫는다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <PaymentConfirmSheet
        open
        price={32000}
        onClose={onClose}
        onConfirm={() => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: "취소" }));

    expect(onClose).toHaveBeenCalled();
  });

  // 결제창을 여는 동안 또 누르면 주문이 두 번 선다.
  it("결제창을 여는 중이면 결제하기를 잠근다", () => {
    render(
      <PaymentConfirmSheet
        open
        price={32000}
        pending
        onClose={() => {}}
        onConfirm={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "결제하기" })).toBeDisabled();
  });
});
