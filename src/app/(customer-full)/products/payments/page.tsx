import { notFound } from "next/navigation";

import { Header } from "@/components/headers/Header";

import { PaymentScreen } from "./_components/PaymentScreen";

export default async function PaymentPage({
  searchParams,
}: PageProps<"/products/payments">) {
  // 결제할 상품. 상품 상세 화면이 실어 보낸다.
  const { productId } = await searchParams;
  const parsedProductId = Number(productId);

  if (!Number.isInteger(parsedProductId) || parsedProductId <= 0) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header title="결제" />
      <PaymentScreen productId={parsedProductId} />
    </div>
  );
}
