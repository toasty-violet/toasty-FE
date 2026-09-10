import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { APP_FRAME_ID } from "@/components/overlays/app-frame";
import type { LiveProduct, LiveProductStatus } from "@/types/live";

import { ViewerProductBar } from "./ViewerProductBar";
import { ViewerProductsSheet } from "./ViewerProductsSheet";

function product(
  over: Partial<LiveProduct> & { productId: number },
): LiveProduct {
  return {
    liveProductId: over.productId,
    name: `상품 ${over.productId}`,
    price: 32000,
    stockQuantity: 1,
    imageUrl: "/image.png",
    displayOrder: over.productId,
    status: "ACTIVE" as LiveProductStatus,
    ...over,
  };
}

const noop = () => {};

// 시트는 앱 프레임으로 포털해 붙는다. jsdom 에는 그 요소가 없어 만들어 준다.
beforeEach(() => {
  const frame = document.createElement("div");
  frame.id = APP_FRAME_ID;
  document.body.append(frame);
});

describe("ViewerProductBar", () => {
  it("소개 중인 상품이 없으면 자리를 지킨다", () => {
    render(
      <ViewerProductBar totalCount={0} onOpenAllProducts={noop} onBuy={noop} />,
    );

    expect(
      screen.getByText("아직 소개 중인 상품이 없어요."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "구매하기" })).toBeNull();
  });

  it("비로그인이면 구매를 잠근다", () => {
    render(
      <ViewerProductBar
        pinned={product({ productId: 1 })}
        totalCount={3}
        buyDisabled
        onOpenAllProducts={noop}
        onBuy={noop}
      />,
    );

    expect(screen.getByRole("button", { name: "구매하기" })).toBeDisabled();
  });

  it("재고가 없으면 구매를 잠근다", () => {
    render(
      <ViewerProductBar
        pinned={product({ productId: 1, stockQuantity: 0 })}
        totalCount={3}
        onOpenAllProducts={noop}
        onBuy={noop}
      />,
    );

    expect(screen.getByRole("button", { name: "구매하기" })).toBeDisabled();
  });

  it("전체상품을 누르면 알린다", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <ViewerProductBar
        pinned={product({ productId: 1 })}
        totalCount={28}
        onOpenAllProducts={onOpen}
        onBuy={noop}
      />,
    );

    await user.click(screen.getByRole("button", { name: /전체상품/ }));

    expect(onOpen).toHaveBeenCalledOnce();
  });
});

describe("ViewerProductsSheet", () => {
  // 살 수 있는지는 편성 상태와 재고가 함께 정한다.
  const products = [
    product({ productId: 1, status: "SCHEDULED" }),
    product({ productId: 2, status: "ACTIVE", stockQuantity: 0 }),
    product({ productId: 3, status: "ACTIVE", stockQuantity: 2 }),
  ];

  function renderSheet(over: { buyDisabled?: boolean } = {}) {
    render(
      <ViewerProductsSheet
        open
        products={products}
        pinnedProductId={3}
        onClose={noop}
        onBuy={noop}
        {...over}
      />,
    );
  }

  it("아직 소개하지 않은 상품에는 버튼을 두지 않는다", () => {
    renderSheet();

    // 상품 3개 중 버튼은 품절 하나와 구매하기 하나뿐이다.
    expect(screen.getByRole("button", { name: "품절" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "구매하기" })).toHaveLength(1);
  });

  it("재고가 없으면 품절로 잠근다", () => {
    renderSheet();

    expect(screen.getByRole("button", { name: "품절" })).toBeDisabled();
  });

  it("고정된 상품을 표시한다", () => {
    renderSheet();

    expect(screen.getByText("현재 고정 상품")).toBeInTheDocument();
  });

  it("비로그인이면 살 수 있는 상품도 잠근다", () => {
    renderSheet({ buyDisabled: true });

    expect(screen.getByRole("button", { name: "구매하기" })).toBeDisabled();
  });

  it("구매하기를 누르면 그 상품을 알린다", async () => {
    const user = userEvent.setup();
    const onBuy = vi.fn();
    render(
      <ViewerProductsSheet
        open
        products={products}
        pinnedProductId={3}
        onClose={noop}
        onBuy={onBuy}
      />,
    );

    await user.click(screen.getByRole("button", { name: "구매하기" }));

    expect(onBuy).toHaveBeenCalledWith(products[2]);
  });
});
