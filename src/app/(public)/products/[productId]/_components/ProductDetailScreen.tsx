"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import RightSmallIcon from "@/assets/RightSmall.svg";
import { ProductGridCard } from "@/components/cards/ProductGridCard";
import { formatThousand } from "@/lib/format";
import { getProduct } from "@/lib/product-api";
import { getSellerProfile } from "@/lib/store-api";

import { ProductImageCarousel } from "./ProductImageCarousel";
import { ProductSellerRow } from "./ProductSellerRow";
import { PurchaseButton } from "./PurchaseButton";

// tokens.json 이 낡아 CSS 변수로 못 쓰는 색이다. Figma 실제 값을 직접 적는다.
const DIVIDER = "#edeef0"; // stroke/neutral-subtle

/** 스토어 이름은 상품 응답에 없어 이미 받아 둔 스토어 조회에서 가져온다. */
function OtherProductsTitle({ sellerId }: { sellerId: number }) {
  const { data: profile } = useQuery({
    queryKey: ["seller-profile", sellerId],
    queryFn: () => getSellerProfile(sellerId),
  });

  return <>{profile ? `${profile.shopName}의 다른 상품` : "다른 상품"}</>;
}

export function ProductDetailScreen({ productId }: { productId: number }) {
  const {
    data: product,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
  });

  if (!product) {
    return (
      <p
        role={isError ? "alert" : undefined}
        className="text-b4-regular text-fg-neutral-secondary flex flex-1 px-20 pt-20"
      >
        {isPending ? "상품을 불러오는 중이에요." : "상품을 불러오지 못했어요."}
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <ProductImageCarousel imageUrls={product.imageUrls} />

        <div className="flex w-full flex-col gap-20 px-20 pt-20 pb-56">
          <ProductSellerRow sellerId={product.sellerId} />

          <hr className="w-full" style={{ borderColor: DIVIDER }} />

          <div className="flex w-full flex-col gap-20">
            <div className="flex w-full flex-col gap-8">
              <h1 className="text-t2-bold text-fg-neutral-solid w-full">
                {product.name}
              </h1>
              <p className="text-l1-semibold text-fg-neutral-solid w-full">
                {formatThousand(product.price)}원
              </p>
            </div>
            {/* 설명은 셀러가 넣은 줄바꿈을 그대로 살린다. */}
            <p className="text-b3-reading-regular text-fg-neutral-primary w-full whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {product.otherProducts.length > 0 && (
            <>
              <hr className="w-full" style={{ borderColor: DIVIDER }} />

              <section className="flex w-full flex-col gap-14">
                <Link
                  href={`/shop/${product.sellerId}`}
                  className="flex w-full items-center justify-between gap-8"
                >
                  <h2 className="text-st2-semibold text-fg-neutral-solid min-w-0 truncate">
                    <OtherProductsTitle sellerId={product.sellerId} />
                  </h2>
                  <RightSmallIcon className="size-24 shrink-0" />
                </Link>
                <ul className="grid w-full grid-cols-3 gap-12">
                  {product.otherProducts.map((other) => (
                    <ProductGridCard
                      key={other.productId}
                      productId={other.productId}
                      name={other.name}
                      price={other.price}
                      imageUrl={other.imageUrl}
                      aspect="square"
                    />
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </div>

      <PurchaseButton productId={product.productId} />
    </>
  );
}
