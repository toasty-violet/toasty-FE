import { Header } from "@/components/headers/Header";

import { OrderDetailScreen } from "@/app/(customer)/orders/_components/OrderDetailScreen";

export default async function OrderDetailPage({
  params,
}: PageProps<"/orders/[orderId]">) {
  const { orderId } = await params;

  return (
    <>
      <Header title="주문 상세" />
      <OrderDetailScreen orderId={Number(orderId)} />
    </>
  );
}
