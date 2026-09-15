import { Header } from "@/components/headers/Header";

import { PurchaseButton } from "./_components/PurchaseButton";

export default async function ProductPage({
  params,
}: PageProps<"/products/[productId]">) {
  const { productId } = await params;

  return (
    <div className="flex flex-1 flex-col">
      {/* 검색 화면이 아직 없어 자리만 지킨다. */}
      <Header rightIconName="search" rightLabel="검색" />
      <div className="flex flex-1 flex-col" />
      <PurchaseButton productId={Number(productId)} />
    </div>
  );
}
