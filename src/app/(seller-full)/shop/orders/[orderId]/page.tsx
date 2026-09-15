import { Header } from "@/components/headers/Header";

import { SellerOrderDetailScreen } from "@/app/(seller)/shop/orders/_components/SellerOrderDetailScreen";

export default async function SellerOrderDetailPage({
  params,
}: PageProps<"/shop/orders/[orderId]">) {
  const { orderId } = await params;

  return (
    <>
      <Header title="주문 상세" />
      <SellerOrderDetailScreen orderId={Number(orderId)} />
    </>
  );
}
