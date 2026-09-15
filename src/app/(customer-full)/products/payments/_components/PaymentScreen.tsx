"use client";

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
import { formatAddress } from "@/lib/address";
import { fetchCustomerProfile } from "@/lib/user";

// 배송비는 아직 스토어별로 받아오지 않아 0원으로 둔다.
const SHIPPING_FEE = 0;

/** 결제 화면에 필요한 상품 값. 상품 상세 API 가 붙으면 그대로 넘겨 받는다. */
export type PaymentProduct = {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  sellerId: number;
  shopName: string;
};

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

export function PaymentScreen({ product }: { product: PaymentProduct }) {
  const router = useRouter();
  const {
    data: profile,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["customer-profile"],
    queryFn: fetchCustomerProfile,
  });

  const totalAmount = product.price + SHIPPING_FEE;

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
          <OrderProductRow
            label={product.shopName}
            productName={product.name}
            quantity={1}
            totalAmount={product.price}
            imageUrl={product.imageUrl}
          />
        </Section>

        <SectionGap />

        <Section title="결제 금액">
          <TotalBox total={totalAmount}>
            <AmountRow label="상품 금액" value={won(product.price)} />
            <AmountRow label="배송비" value={won(SHIPPING_FEE)} />
          </TotalBox>
        </Section>
      </div>

      {/* 결제 연동 전이라 결제창 없이 완료 화면으로만 넘긴다. */}
      <BottomButton
        label={`${won(totalAmount)} 결제하기`}
        onClick={() =>
          router.push(
            `/products/payments/complete?sellerId=${product.sellerId}`,
          )
        }
      />
    </>
  );
}
