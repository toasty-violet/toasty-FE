import { describe, expect, it } from "vitest";

import { shippingFeeFor, type ProductDetail } from "./product";

function product(price: number, shippingFee: ProductDetail["shippingFee"]) {
  return {
    productId: 1,
    sellerId: 1,
    name: "상품",
    price,
    description: "",
    imageUrls: [],
    otherProducts: [],
    shippingFee,
  } satisfies ProductDetail;
}

describe("shippingFeeFor", () => {
  it("기준이 없으면 기본 배송비를 받는다", () => {
    const fee = { baseShippingFee: 3000, freeShippingThreshold: 0 };

    expect(shippingFeeFor(product(29000, fee))).toBe(3000);
  });

  it("무료배송 기준을 넘으면 받지 않는다", () => {
    const fee = { baseShippingFee: 3000, freeShippingThreshold: 30000 };

    expect(shippingFeeFor(product(30000, fee))).toBe(0);
  });

  it("기준에 못 미치면 기본 배송비를 받는다", () => {
    const fee = { baseShippingFee: 3000, freeShippingThreshold: 30000 };

    expect(shippingFeeFor(product(29000, fee))).toBe(3000);
  });
});
