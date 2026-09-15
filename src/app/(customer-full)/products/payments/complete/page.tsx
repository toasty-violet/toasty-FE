import { Header } from "@/components/headers/Header";

import { OrderCompleteScreen } from "./_components/OrderCompleteScreen";

export default async function OrderCompletePage({
  searchParams,
}: PageProps<"/products/payments/complete">) {
  // 쇼핑 계속하기로 돌아갈 스토어. 결제 화면이 상품의 sellerId 를 실어 보낸다.
  const { sellerId } = await searchParams;
  const parsedSellerId = Number(sellerId);

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <OrderCompleteScreen
        // 스토어를 못 받으면 돌아갈 곳이 없어 홈으로 보낸다.
        shopPath={
          Number.isInteger(parsedSellerId) && parsedSellerId > 0
            ? `/shop/${parsedSellerId}`
            : "/"
        }
      />
    </div>
  );
}
