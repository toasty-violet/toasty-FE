"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { BottomButton } from "@/components/buttons/BottomButton";
import { OrderProductRow } from "@/components/cards/OrderProductRow";
import {
  AmountRow,
  InfoRow,
  Section,
  SectionGap,
  TotalBox,
  won,
} from "@/components/sections/InfoSection";
import { usePurchase } from "@/app/live/_lib/use-purchase";
import { formatAddress } from "@/lib/address";
import { getProduct } from "@/lib/product-api";
import { shippingFeeFor } from "@/types/product";
import { getSellerProfile } from "@/lib/store-api";
import { fetchCustomerProfile } from "@/lib/user";

/** 받는사람·연락처·배송지 세 줄 자리를 잡아 둔다. 배송지는 두 줄까지 자주 찬다. */
function ShippingSkeleton() {
  const valueWidths = ["w-1/4", "w-2/5", "w-full"];

  return (
    <div aria-hidden className="flex w-full flex-col gap-12">
      {valueWidths.map((width) => (
        <div key={width} className="flex w-full items-start gap-8">
          <div className="bg-bg-neutral-weak rounded-4 h-12 w-[8rem] shrink-0 animate-pulse" />
          <div
            className={`bg-bg-neutral-weak rounded-4 h-12 animate-pulse ${width}`}
          />
        </div>
      ))}
    </div>
  );
}

/** 상품 한 줄 자리를 잡아 둔다. 사진과 두 줄짜리 글이 들어간다. */
function ProductSkeleton() {
  return (
    <div aria-hidden className="flex w-full items-center gap-12">
      <div className="rounded-8 bg-bg-neutral-weak size-64 shrink-0 animate-pulse" />
      <div className="flex min-w-0 flex-1 flex-col gap-10">
        <div className="bg-bg-neutral-weak rounded-4 h-11 w-2/5 animate-pulse" />
        <div className="bg-bg-neutral-weak rounded-4 h-12 w-3/5 animate-pulse" />
      </div>
    </div>
  );
}

export function PaymentScreen({ productId }: { productId: number }) {
  const router = useRouter();
  const {
    data: profile,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["customer-profile"],
    queryFn: fetchCustomerProfile,
  });

  const { data: product, isError: isProductError } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
  });

  // 스토어 이름은 상품 응답에 없어 따로 부른다. 상품을 받아야 셀러를 알 수 있다.
  const { data: seller } = useQuery({
    queryKey: ["seller-profile", product?.sellerId],
    queryFn: () => getSellerProfile(product!.sellerId),
    enabled: product !== undefined,
  });

  // 승인까지 끝나야 주문이 선다. 그 뒤에야 완료 화면으로 넘긴다.
  const [confirmed, setConfirmed] = useState(false);
  const purchase = usePurchase({
    returnPath: `/products/payments?productId=${productId}`,
    onConfirmed: () => setConfirmed(true),
  });

  // 결제창에서 돌아오면 상품을 다시 받는 중이라, 승인이 상품보다 먼저 끝날 수 있다.
  // 완료 화면은 쇼핑 계속하기로 돌아갈 스토어가 필요해 상품을 받은 뒤에 넘긴다.
  useEffect(() => {
    if (!confirmed) return;
    if (!product && !isProductError) return;

    router.replace(
      product
        ? `/products/payments/complete?sellerId=${product.sellerId}`
        : "/products/payments/complete",
    );
  }, [confirmed, product, isProductError, router]);

  // 스토어가 정한 배송비. 무료배송 기준을 넘으면 0 원이다.
  const shippingFee = product ? shippingFeeFor(product) : 0;
  const totalAmount = (product?.price ?? 0) + shippingFee;

  return (
    <>
      <div className="bg-bg-layer-default flex flex-1 flex-col overflow-y-auto pb-56">
        <Section title="배송 정보">
          {isPending && <ShippingSkeleton />}

          {isError && (
            <p
              role="alert"
              className="text-b4-regular text-fg-neutral-secondary"
            >
              배송 정보를 불러오지 못했어요.
            </p>
          )}

          {profile && (
            <div className="flex w-full flex-col gap-12">
              <InfoRow label="받는사람" value={profile.name} />
              <InfoRow label="연락처" value={profile.phoneNumber} />
              <InfoRow
                label="배송지"
                value={`[${profile.address.postalCode}] ${formatAddress(
                  profile.address,
                )} ${profile.address.detailAddress}`.trim()}
              />
            </div>
          )}
        </Section>

        <SectionGap />

        <Section title="주문 상품">
          {product ? (
            <OrderProductRow
              label={seller?.shopName}
              productName={product.name}
              quantity={1}
              totalAmount={product.price}
              imageUrl={product.imageUrls[0] ?? ""}
            />
          ) : (
            <ProductSkeleton />
          )}
        </Section>

        <SectionGap />

        <Section title="결제 금액">
          <TotalBox total={totalAmount}>
            <AmountRow label="상품 금액" value={won(product?.price ?? 0)} />
            <AmountRow label="배송비" value={won(shippingFee)} />
          </TotalBox>
        </Section>
      </div>

      {/* 누르면 주문이 만들어지고 결제창이 열린다. 돌아오면 승인까지 이어서 보낸다. */}
      <BottomButton
        label={`${won(totalAmount)} 결제하기`}
        description={purchase.message}
        disabled={!product || purchase.pending}
        onClick={() =>
          product &&
          purchase.buyNow({
            productId: product.productId,
            name: product.name,
            price: product.price,
          })
        }
      />
    </>
  );
}
