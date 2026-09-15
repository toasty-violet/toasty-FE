import { Header } from "@/components/headers/Header";

import {
  PaymentScreen,
  type PaymentProduct,
} from "./_components/PaymentScreen";

// 손님용 상품 조회 API 가 아직 없어 상품 값만 임시로 채운다.
// API 가 붙으면 이 자리를 조회 결과로 바꾼다.
const PLACEHOLDER_PRODUCT: Omit<PaymentProduct, "productId"> = {
  name: "아이보리 골지 가디건",
  price: 29000,
  imageUrl: "",
  sellerId: 1,
  shopName: "토스티샵",
};

export default async function PaymentPage({
  searchParams,
}: PageProps<"/products/payments">) {
  // 결제할 상품. 상품 상세 화면이 실어 보낸다.
  const { productId } = await searchParams;

  return (
    <div className="flex flex-1 flex-col">
      <Header title="결제" />
      <PaymentScreen
        product={{ ...PLACEHOLDER_PRODUCT, productId: Number(productId) }}
      />
    </div>
  );
}
