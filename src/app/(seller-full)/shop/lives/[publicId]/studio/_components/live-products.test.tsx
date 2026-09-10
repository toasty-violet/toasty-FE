import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { APP_FRAME_ID } from "@/components/overlays/app-frame";
import type { LiveProduct, LiveProductStatus } from "@/types/live";

import { AllProductsSheet } from "./AllProductsSheet";
import { LiveProductBar } from "./LiveProductBar";
import { ProductEditSheet } from "./ProductEditSheet";

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

describe("LiveProductBar", () => {
  it("편성 상태를 그대로 배지로 보여준다", () => {
    const { rerender } = render(
      <LiveProductBar
        pinned={product({ productId: 1, status: "ACTIVE" })}
        totalCount={3}
        pinning={false}
        onOpenAllProducts={noop}
        onEditPinned={noop}
        onPinNext={noop}
      />,
    );
    expect(screen.getByText("판매중")).toBeInTheDocument();

    rerender(
      <LiveProductBar
        pinned={product({ productId: 1, status: "CLOSED" })}
        totalCount={3}
        pinning={false}
        onOpenAllProducts={noop}
        onEditPinned={noop}
        onPinNext={noop}
      />,
    );
    expect(screen.getByText("판매완료")).toBeInTheDocument();
  });

  // 재고가 0이어도 서버는 상태를 되돌리지 않는다.
  it("재고가 0이어도 판매중이면 판매중으로 둔다", () => {
    render(
      <LiveProductBar
        pinned={product({ productId: 1, stockQuantity: 0, status: "ACTIVE" })}
        totalCount={3}
        pinning={false}
        onOpenAllProducts={noop}
        onEditPinned={noop}
        onPinNext={noop}
      />,
    );

    expect(screen.getByText("판매중")).toBeInTheDocument();
    expect(screen.getByText("재고 0개")).toBeInTheDocument();
  });

  it("고정한 상품이 없으면 현재 상품 수정을 잠근다", () => {
    render(
      <LiveProductBar
        totalCount={3}
        pinning={false}
        onOpenAllProducts={noop}
        onEditPinned={noop}
        onPinNext={noop}
      />,
    );

    expect(
      screen.getByRole("button", { name: /현재 상품 수정/ }),
    ).toBeDisabled();
    expect(
      screen.getByText("아직 소개 중인 상품이 없어요."),
    ).toBeInTheDocument();
  });

  it("다음 상품 고정을 누르면 알린다", async () => {
    const user = userEvent.setup();
    const onPinNext = vi.fn();
    render(
      <LiveProductBar
        pinned={product({ productId: 1 })}
        totalCount={3}
        pinning={false}
        onOpenAllProducts={noop}
        onEditPinned={noop}
        onPinNext={onPinNext}
      />,
    );

    await user.click(screen.getByRole("button", { name: /다음 상품 고정/ }));

    expect(onPinNext).toHaveBeenCalledOnce();
  });
});

describe("AllProductsSheet", () => {
  const products = [
    product({ productId: 1, status: "SCHEDULED" }),
    product({ productId: 2, status: "ACTIVE" }),
  ];

  it("고정된 상품은 표시하고 고정 버튼을 잠근다", () => {
    render(
      <AllProductsSheet
        open
        products={products}
        pinnedProductId={2}
        onClose={noop}
        onEdit={noop}
        onPin={noop}
      />,
    );

    expect(screen.getByText("현재 고정 상품")).toBeInTheDocument();
    const pins = screen.getAllByRole("button", { name: "고정" });
    expect(pins[0]).toBeEnabled();
    expect(pins[1]).toBeDisabled();
  });

  it("편성된 상품이 없으면 없다고 알린다", () => {
    render(
      <AllProductsSheet
        open
        products={[]}
        pinnedProductId={null}
        onClose={noop}
        onEdit={noop}
        onPin={noop}
      />,
    );

    expect(screen.getByText("편성된 상품이 없어요.")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  // 다 판 상품은 더 소개할 수 없다.
  it("판매완료 상품은 고정할 수 없다", () => {
    render(
      <AllProductsSheet
        open
        products={[product({ productId: 9, status: "CLOSED" })]}
        pinnedProductId={null}
        onClose={noop}
        onEdit={noop}
        onPin={noop}
      />,
    );

    expect(screen.getByRole("button", { name: "고정" })).toBeDisabled();
  });

  it("고정을 누르면 그 상품을 알린다", async () => {
    const user = userEvent.setup();
    const onPin = vi.fn();
    render(
      <AllProductsSheet
        open
        products={products}
        pinnedProductId={2}
        onClose={noop}
        onEdit={noop}
        onPin={onPin}
      />,
    );

    await user.click(screen.getAllByRole("button", { name: "고정" })[0]);

    expect(onPin).toHaveBeenCalledWith(products[0]);
  });
});

describe("ProductEditSheet", () => {
  it("고칠 상품의 값으로 시작한다", () => {
    render(
      <ProductEditSheet
        product={product({ productId: 1, price: 32000, stockQuantity: 7 })}
        saving={false}
        error={null}
        onSave={noop}
        onClose={noop}
      />,
    );

    expect(screen.getByLabelText("가격(원)")).toHaveValue("32,000");
    expect(screen.getByLabelText("재고 수량")).toHaveValue("7");
  });

  // 서버가 재고 0을 받지 않는다.
  it("재고를 0으로 두면 저장을 잠근다", async () => {
    const user = userEvent.setup();
    render(
      <ProductEditSheet
        product={product({ productId: 1 })}
        saving={false}
        error={null}
        onSave={noop}
        onClose={noop}
      />,
    );

    await user.clear(screen.getByLabelText("재고 수량"));

    expect(screen.getByRole("button", { name: "저장하기" })).toBeDisabled();
    expect(
      screen.getByText("재고는 1개 이상이어야 합니다."),
    ).toBeInTheDocument();
  });

  it("고친 값을 그대로 넘긴다", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <ProductEditSheet
        product={product({ productId: 1, price: 32000, stockQuantity: 1 })}
        saving={false}
        error={null}
        onSave={onSave}
        onClose={noop}
      />,
    );

    const price = screen.getByLabelText("가격(원)");
    await user.clear(price);
    await user.type(price, "45000");
    await user.click(screen.getByRole("button", { name: "저장하기" }));

    expect(onSave).toHaveBeenCalledWith({ price: 45000, stockQuantity: 1 });
  });
});
